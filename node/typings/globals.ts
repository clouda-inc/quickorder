interface SearchArgs {
  pageSize: number
  page: number
  where?: string
  skuId: string
  soc?: string
  skuRefId: string
}

interface PlantData {
  plant: number
  salesOrganizationCode: number
}
interface ClientBrand {
  brand: string
  client: string
  targetSystem: string
}

interface MoqUM {
  unitMultiplier: string
  minOrderQuantity: string
}

interface Pagination {
  pageSize: number
  page: number
  total: number
}

interface SalesOrgPlant {
  pagination: Pagination
  data: PlantData[]
}
interface BrandForClients {
  pagination: Pagination
  data: ClientBrand[]
}
interface UnitMultiplierMoQ {
  pagination: Pagination
  data: MoqUM
}

interface KeyValue {
  key: string
  value: string
}

interface AppSettings {
  agoraBaseUrl: string
  agoraSubscriptionKey: string
}

interface SearchResponse {
  skuRefId: string,
  customerSku: string,
  customerNumber: string
}

interface SkuRefIdWithCustomerPartArgs {
  partNumber: string;
  customerNumber: string;
  targetSystem: string;
}
