import React, { useEffect, useMemo } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useMutation, useQuery } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql/graphql/__types_entrypoint'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { ExtensionPoint } from 'vtex.render-runtime'
import type { OrderForm } from 'vtex.checkout-graphql'

import GET_PRODUCT_DATA from './queries/getPrductAvailability.graphql'
import { validateQuantity } from './utils'

type Props = {
  enablePunchoutQuoteValidation?: boolean
}

const PunchoutReviewAndAddToCart: StorefrontFunctionComponent<Props> = ({
  enablePunchoutQuoteValidation = false,
}) => {
  const { orderForm }: { orderForm: OrderForm } = useOrderForm()
  const { soldTo, soldToCustomerNumber, soldToInfo, targetSystem } =
    (orderForm.customData?.customApps ?? []).find(
      (app) => app.id === 'checkout-simulation'
    )?.fields ?? {}

  const quoteItems = JSON.parse(
    (orderForm.customData?.customApps ?? []).find(
      (app) => app.id === 'punchout-to-go'
    )?.fields.quoteItems ?? '[]'
  )

  const [addToCart] = useMutation<{ addToCart: OrderFormType }, { items: [] }>(
    ADD_TO_CART
  )

  const soldToSelected = useMemo(() => {
    return !!(soldTo && soldToCustomerNumber && soldToInfo && targetSystem)
  }, [soldToInfo, soldTo, soldToCustomerNumber, targetSystem])

  const { data } = useQuery(GET_PRODUCT_DATA, {
    skip: !enablePunchoutQuoteValidation || !soldToSelected,
    variables: {
      refIds: quoteItems.map((quoteItem) => quoteItem.sku),
      customerNumber: soldTo,
      targetSystem,
      salesOrganizationCode:
        JSON.parse(soldToInfo ?? '{}').salesOrganizationCode ?? '',
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
        window.location.pathname = '/cart'
      })
    }
  }, [addToCart, data])

  if (!enablePunchoutQuoteValidation) {
    return null
  }

  if (!soldToSelected) {
    return <ExtensionPoint id="sold-to-account-selector" />
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
