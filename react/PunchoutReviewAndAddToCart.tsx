import React, { useEffect, useMemo, useState } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useMutation, useQuery } from 'react-apollo'
import type {
  MutationAddToCartArgs,
  OrderForm as OrderFormType,
} from 'vtex.checkout-graphql/graphql/__types_entrypoint'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import type { OrderForm } from 'vtex.checkout-graphql'
import { useUpdateCustomField } from 'sbdsefuat.shopping-cart/OrderFormCustomFieldHooks'
import { Button, Modal, Spinner } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import moment from 'moment'

import GET_PRODUCT_DATA from './queries/getPrductAvailability.graphql'
import SET_SOLD_TO from './mutations/setSoldToAccount.graphql'
import { validateQuantity } from './utils'

type Props = {
  enablePunchoutQuoteValidation?: boolean
}

type OrgInfo = {
  soldTo: string
  soldToInfo: string
  soldToCustomerNumber: string
  targetSystem: string
}

const PunchoutReviewAndAddToCart: StorefrontFunctionComponent<Props> = ({
  enablePunchoutQuoteValidation = false,
}) => {
  const { orderForm }: { orderForm: OrderForm } = useOrderForm()
  const [updateCustomFields] = useUpdateCustomField()

  const [setSoldTo] = useMutation<SetSoldToResponse>(SET_SOLD_TO)
  const { rootPath = '' } = useRuntime()
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null)
  const [tcQuoteMessages, setTcQuoteMessages] = useState<
    Array<{ id: string; message: string }>
  >([])

  useEffect(() => {
    const { soldTo, soldToCustomerNumber, soldToInfo, targetSystem } =
      (orderForm.customData?.customApps ?? []).find(
        (app) => app.id === 'checkout-simulation'
      )?.fields ?? {}

    setOrgInfo({
      soldTo,
      soldToCustomerNumber,
      soldToInfo,
      targetSystem,
    })
  }, [orderForm.customData?.customApps])

  useEffect(() => {
    if (!orgInfo) {
      setSoldTo().then((response) => {
        if (response.data) {
          const { soldTo, soldToCustomerNumber, soldToInfo, targetSystem } =
            response.data.setSoldToAccount.simulationInfo

          setOrgInfo({
            soldTo,
            soldToCustomerNumber,
            soldToInfo,
            targetSystem,
          })
        }
      })
    }
  }, [orgInfo, setSoldTo])

  const quoteItems = JSON.parse(
    (orderForm.customData?.customApps ?? []).find(
      (app) => app.id === 'punchout-to-go'
    )?.fields.quoteItems ?? '[]'
  ) as QuoteItem[]

  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [invalidItems, setInvalidItems] = useState<any>([])

  const intl = useIntl()

  const [addToCart] = useMutation<
    { addToCart: OrderFormType },
    MutationAddToCartArgs
  >(ADD_TO_CART)

  const soldToSelected = useMemo(() => {
    return !!(
      orgInfo?.soldTo &&
      orgInfo.soldToCustomerNumber &&
      orgInfo.soldToInfo &&
      orgInfo.targetSystem
    )
  }, [orgInfo])

  const { data, loading, error } = useQuery<{
    getSkuAvailability: Availability
  }>(GET_PRODUCT_DATA, {
    skip: !enablePunchoutQuoteValidation || !soldToSelected,
    variables: {
      refIds: quoteItems.map((quoteItem) => quoteItem.sku),
      customerNumber: orgInfo?.soldTo,
      targetSystem: orgInfo?.targetSystem,
      salesOrganizationCode:
        JSON.parse(orgInfo?.soldToInfo ?? '{}').salesOrganizationCode ?? '',
    },
  })

  useEffect(() => {
    if (data) {
      const itemsToAdd = (data?.getSkuAvailability?.items ?? []).filter(
        (reviewedItem) =>
          reviewedItem.sku !== null &&
          reviewedItem.availability === 'authorized'
      )

      addToCart({
        variables: {
          items: itemsToAdd.map((item) => ({
            id: parseInt(item.sku, 10),
            seller: item.seller.id,
            quantity:
              ((orderForm.items ?? []).find((ofItem) => ofItem.id === item.sku)
                ?.quantity ?? 0) +
              validateQuantity(
                item.moq,
                item.unitMultiplier,
                quoteItems.find((qi) => qi.sku === item.refid)?.quantity ?? 1
              ) /
                item.unitMultiplier,
          })),
        },
      }).then(async (response) => {
        const quoteRequestedDeliveryDate: string | undefined = (
          orderForm.customData?.customApps ?? []
        ).find((app) => app.id === 'punchout-to-go')?.fields
          ?.requestedDeliveryDate

        const itemInputs = itemsToAdd
          .filter((item) =>
            quoteItems.some(
              (qi) => qi.sku === item.refid && !!qi.requested_delivery_date
            )
          )
          .map((item) => ({
            uniqueId: response.data?.addToCart.items.find(
              (ofItem) => ofItem.refId === item.refid
            )?.uniqueId,
            itemId: response.data?.addToCart.items.find(
              (ofItem) => ofItem.refId === item.refid
            )?.id,
            selectedDeliveryDate: quoteItems.find((qi) => qi.sku === item.refid)
              ?.requested_delivery_date,
          }))

        const fieldsToUpdate: Array<{ name: string; value: string }> = []
        const minDate = new Date()

        // min date is 7 days from current date
        minDate.setUTCHours(0, 0, 0, 0)
        minDate.setDate(minDate.getDate() + 7)
        const tcQuoteMessageList: Array<{ id: string; message: string }> = []

        if (quoteRequestedDeliveryDate) {
          fieldsToUpdate.push({
            name: 'requiredDeliveryDate',
            value:
              new Date(quoteRequestedDeliveryDate) > minDate
                ? quoteRequestedDeliveryDate
                : moment(minDate).format('YYYY-MM-DD'),
          })
          if (new Date(quoteRequestedDeliveryDate) < minDate) {
            tcQuoteMessageList.push({
              id: 'header-message',
              message: intl.formatMessage({
                id: 'store/quickorder.trade-centric.header.delivery-date',
              }),
            })
          }
        }

        if (itemInputs.length > 0) {
          fieldsToUpdate.push({
            name: 'itemInputs',
            value: JSON.stringify(
              itemInputs.map((ii) => ({
                ...ii,
                ...(ii.selectedDeliveryDate
                  ? {
                      selectedDeliveryDate:
                        new Date(ii.selectedDeliveryDate) > minDate
                          ? ii.selectedDeliveryDate
                          : moment(minDate).format('YYYY-MM-DD'),
                    }
                  : {}),
              }))
            ),
          })
          if (
            itemInputs.some(
              (ii) =>
                ii.selectedDeliveryDate &&
                new Date(ii.selectedDeliveryDate) < minDate
            )
          ) {
            tcQuoteMessageList.push({
              id: 'line-item-message',
              message: intl.formatMessage({
                id: 'store/quickorder.trade-centric.item.delivery-date',
              }),
            })
          }
        }

        if (fieldsToUpdate.length > 0) {
          await updateCustomFields({
            appId: 'checkout-simulation',
            fields: [
              ...fieldsToUpdate,
              {
                name: 'isValidSimulation',
                value: 'false',
              },
            ],
          })
        }

        const unavailableItems = (data?.getSkuAvailability?.items ?? []).filter(
          (reviewedItem: any) =>
            reviewedItem.sku === null ||
            reviewedItem.availability !== 'authorized'
        )

        setInvalidItems(unavailableItems)
        setTcQuoteMessages(tcQuoteMessageList)

        if (unavailableItems.length > 0 || tcQuoteMessageList.length > 0) {
          setWarningModalOpen(true)
        } else {
          // window.location.pathname = `${rootPath}/cart`
        }
      })
    }
  }, [addToCart, data])

  useEffect(() => {
    if (error) {
      // window.location.pathname = `${rootPath}/cart`
    }
  }, [error, rootPath])

  if (!enablePunchoutQuoteValidation) {
    return null
  }

  if (!soldToSelected) {
    return <ExtensionPoint id="sold-to-account-selector" />
  }

  if (loading) {
    return (
      <div className="mw9 center pa7 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (warningModalOpen) {
    return (
      <Modal
        centered
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false)
          // window.location.pathname = `${rootPath}/cart`
        }}
        bottomBar={
          <div className="nowrap">
            <span>
              <Button
                variation="primary"
                onClick={() => {
                  setWarningModalOpen(false)
                  // window.location.pathname = `${rootPath}/cart`
                }}
              >
                {intl.formatMessage({
                  id: 'store/quickorder.punchout.continue',
                })}
              </Button>
            </span>
          </div>
        }
      >
        <div className="dark-gray">
          <p>
            {intl.formatMessage(
              { id: 'store/quickorder.punchout.unavailable' },
              { items: invalidItems.map((item: any) => item.refid).join(', ') }
            )}
          </p>
          {tcQuoteMessages.map((tcqm) => (
            <p key={tcqm.id}>{tcqm.message}</p>
          ))}
        </div>
      </Modal>
    )
  }

  return <div />
}

export default PunchoutReviewAndAddToCart

PunchoutReviewAndAddToCart.schema = {
  title: 'editor/quick-order.punchout.title',
  description: 'editor/quick-order.punchout.description',
  type: 'object',
  properties: {
    enablePunchoutQuoteValidation: {
      title: 'editor/quick-order.punchout.enablePunchoutQuoteValidation.title',
      description:
        'editor/quick-order.punchout.enablePunchoutQuoteValidation.description',
      type: 'boolean',
      default: false,
    },
  },
}
