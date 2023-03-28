import React, { useEffect, useMemo, useState } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useMutation, useQuery } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql/graphql/__types_entrypoint'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import type { OrderForm } from 'vtex.checkout-graphql'
import { Button, Modal, Spinner } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

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
  const [setSoldTo] = useMutation<SetSoldToResponse>(SET_SOLD_TO)
  const { rootPath = '' } = useRuntime()
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null)

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
  )

  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [invalidItems, setInvalidItems] = useState<any>([])

  const intl = useIntl()

  const [addToCart] = useMutation<{ addToCart: OrderFormType }, { items: [] }>(
    ADD_TO_CART
  )

  const soldToSelected = useMemo(() => {
    return !!(
      orgInfo?.soldTo &&
      orgInfo.soldToCustomerNumber &&
      orgInfo.soldToInfo &&
      orgInfo.targetSystem
    )
  }, [orgInfo])

  const { data, loading, error } = useQuery(GET_PRODUCT_DATA, {
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
      addToCart({
        variables: {
          items: (data?.getSkuAvailability?.items ?? [])
            .filter(
              (reviewedItem) =>
                reviewedItem.sku !== null &&
                reviewedItem.availability === 'authorized'
            )
            .map((item) => ({
              id: parseInt(item.sku, 10),
              seller: item.seller.id,
              quantity:
                ((orderForm.items ?? []).find(
                  (ofItem) => ofItem.id === item.sku
                )?.quantity ?? 0) +
                validateQuantity(
                  item.moq,
                  item.unitMultiplier,
                  quoteItems.find((qi) => qi.sku === item.refid)?.quantity ?? 1
                ) /
                  item.unitMultiplier,
            })),
        },
      }).then(() => {
        const unavailableItems = (data?.getSkuAvailability?.items ?? []).filter(
          (reviewedItem: any) =>
            reviewedItem.sku === null ||
            reviewedItem.availability !== 'authorized'
        )

        setInvalidItems(unavailableItems)

        if (unavailableItems.length > 0) {
          setWarningModalOpen(true)
        } else {
          window.location.pathname = `${rootPath}/cart`
        }
      })
    }
  }, [addToCart, data])

  useEffect(() => {
    if (error) {
      window.location.pathname = `${rootPath}/cart`
    }
  }, [error, rootPath])

  if (!enablePunchoutQuoteValidation) {
    console.info('Quick order PO 1')

    return null
  }

  if (!soldToSelected) {
    console.info('Quick order PO 2')

    return <ExtensionPoint id="sold-to-account-selector" />
  }

  if (loading) {
    console.info('Quick order PO 3')

    return (
      <div className="mw9 center pa7 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (warningModalOpen) {
    console.info('Quick order PO 4')

    return (
      <Modal
        centered
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false)
          window.location.pathname = `${rootPath}/cart`
        }}
        bottomBar={
          <div className="nowrap">
            <span>
              <Button
                variation="primary"
                onClick={() => {
                  setWarningModalOpen(false)
                  window.location.pathname = `${rootPath}/cart`
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
        </div>
      </Modal>
    )
  }

  console.info('Quick order PO 5')

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
