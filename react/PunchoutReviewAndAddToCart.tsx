import React, { useEffect, useState } from 'react'
// import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useMutation, useQuery } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql/graphql/__types_entrypoint'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { orderForm as ORDER_FORM } from 'vtex.checkout-resources/Queries'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import type { OrderForm } from 'vtex.checkout-graphql'
import { Button, Modal, Spinner } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import GET_PRODUCT_DATA from './queries/getPrductAvailability.graphql'
// import SET_SOLD_TO from './mutations/setSoldToAccount.graphql'
import { validateQuantity } from './utils'

type Props = {
  enablePunchoutQuoteValidation?: boolean
}

type OrgAccountField = {
  soldTo: string
  soldToCustomerNumber: string
  soldToInfo: string
  targetSystem: string
}

const PunchoutReviewAndAddToCart: StorefrontFunctionComponent<Props> = ({
  enablePunchoutQuoteValidation = false,
}) => {
  const {
    data: orderForm,
    // loading: orderFormLoading,
    // error: orderFormError,
    // refetch: refetchOrderForm,
  } = useQuery<{ orderForm: OrderForm }>(ORDER_FORM)

  const { rootPath = '' } = useRuntime()
  const [orgAccountFields, setOrgAccountFields] =
    useState<OrgAccountField | null>(null)

  const [soldToSelected, setSoldToSelected] = useState(false)
  // const [setSoldTo, { loading: settingSoldTo, error: setSoldToError }] =
  //   useMutation(SET_SOLD_TO)

  useEffect(() => {
    const { soldTo, soldToCustomerNumber, soldToInfo, targetSystem } =
      (orderForm?.orderForm.customData?.customApps ?? []).find(
        (app) => app.id === 'checkout-simulation'
      )?.fields ?? {}

    setOrgAccountFields({
      soldTo,
      soldToCustomerNumber,
      soldToInfo,
      targetSystem,
    })

    if (soldTo && soldToCustomerNumber && soldToInfo && targetSystem) {
      setSoldToSelected(true)
    }
  }, [orderForm?.orderForm.customData?.customApps])

  const [quoteItems, setQuoteItems] = useState<any>([])

  useEffect(() => {
    setQuoteItems(
      JSON.parse(
        (orderForm?.orderForm.customData?.customApps ?? []).find(
          (app) => app.id === 'punchout-to-go'
        )?.fields.quoteItems ?? '[]'
      )
    )
  }, [orderForm?.orderForm.customData?.customApps])

  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [invalidItems, setInvalidItems] = useState<any>([])

  const intl = useIntl()

  const [addToCart] = useMutation<{ addToCart: OrderFormType }, { items: [] }>(
    ADD_TO_CART
  )

  // const soldToSelected = useMemo(() => {
  //   return !!(
  //     orgAccountFields?.soldTo &&
  //     orgAccountFields.soldToCustomerNumber &&
  //     orgAccountFields.soldToInfo &&
  //     orgAccountFields.targetSystem
  //   )
  // }, [
  //   orgAccountFields?.soldToInfo,
  //   orgAccountFields?.soldTo,
  //   orgAccountFields?.soldToCustomerNumber,
  //   orgAccountFields?.targetSystem,
  // ])

  const { data, loading, error } = useQuery(GET_PRODUCT_DATA, {
    skip:
      !orgAccountFields ||
      !enablePunchoutQuoteValidation ||
      !soldToSelected ||
      quoteItems.length === 0,
    variables: {
      refIds: quoteItems.map((quoteItem) => quoteItem.sku),
      customerNumber: orgAccountFields?.soldTo,
      targetSystem: orgAccountFields?.targetSystem,
      salesOrganizationCode:
        JSON.parse(orgAccountFields?.soldToInfo ?? '{}')
          .salesOrganizationCode ?? '',
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
                ((orderForm?.orderForm.items ?? []).find(
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
  }, [addToCart, data, orderForm?.orderForm.items, quoteItems, rootPath])

  useEffect(() => {
    if (error) {
      window.location.pathname = `${rootPath}/cart`
    }
  }, [error, rootPath])

  if (!enablePunchoutQuoteValidation) {
    console.info('poReview-test1')

    return <div className="poReview-test1" />
  }

  if (!soldToSelected) {
    console.info('soldToSelected 2', soldToSelected)
    console.info('poReview-test2')

    return <ExtensionPoint id="sold-to-account-selector" />
  }

  if (quoteItems.length === 0) {
    console.info('soldToSelected 2.1', soldToSelected)
    console.info('poReview-test2.1')

    return null
  }

  if (loading) {
    console.info('poReview-test3')

    return (
      <div className="mw9 center pa7 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (warningModalOpen) {
    console.info('poReview-test4')

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

  console.info('poReview-test5')

  return <div className="poReview-test5" />
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
