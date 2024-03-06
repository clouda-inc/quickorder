import {
  fieldResolvers as searchFieldResolvers,
  queries as searchQueries,
} from './search'
import { queries as priceQueries } from './pricing/pricing'
import { queries as stockAvailabilityQueries } from './stockAvailability/stockAvailability'
import { queries as skuQueries } from './sku/sku'

export const resolvers = {
  ...searchFieldResolvers,
  Query: {
    ...searchQueries,
    ...priceQueries,
    ...stockAvailabilityQueries,
    ...skuQueries,
  },
}
