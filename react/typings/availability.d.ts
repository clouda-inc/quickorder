type AvailabilityItem = {
  refid: string
  sku: string
  productId: string
  skuName: string
  uom: string
  uomDescription: string
  moq: number
  leadTime: string
  linkText: string
  availability: string
  seller: {
    id: string
    name: string
  }
  availableQuantity: string
  productName: string
  price: number
  unitMultiplier: number
}

type Availability = {
  items: AvailabilityItem[]
}
