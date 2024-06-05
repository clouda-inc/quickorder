interface KeyValue {
  key: string
  value: string
}

interface ItemPrices {
  adjustment: string
  cB: string
  currency: string
  customerGroup: string
  customer: string
  effectiveDate: string
  itemNumber: string
  price: string
  quantity: string
  uom: string
}

type GtmProductDetail = {
  productId: string
  productName: string
  categoryTree: Category[]
}

type Category = {
  name: string
}

interface ItemStatus {
  index: number
  sku?: string
  error?: string
  availability?: string
  availableQuantity?: number
  isQuantityLoading?: boolean
  isPriceLoading?: boolean
  price?: number
}
