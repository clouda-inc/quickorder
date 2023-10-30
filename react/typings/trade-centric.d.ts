type DeliveryItemData = {
  uniqueId: number
  itemId: string
  selectedDeliveryDate: string
}

type QuoteItem = {
  sku: string
  quantity: number
  requested_delivery_date?: string
}

type Quote = {
  poNumber: string
  requestedDeliveryDate?: string
  items: QuoteItem[]
}
