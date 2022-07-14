import type { OrderForm } from 'vtex.checkout-graphql'

export const isPunchoutQuoteSession = (orderForm: OrderForm) =>
  JSON.parse(
    (orderForm.customData?.customApps ?? []).find(
      (app) => app.id === 'punchout-to-go'
    )?.fields.quoteItems ?? '[]'
  ).length > 0
