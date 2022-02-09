import {
  fieldResolvers as searchFieldResolvers,
  queries as searchQueries,
} from './search'

import {
  queries as priceQueries,
} from './pricing/pricing'

import {
  queries as stockAvailabilityQueries,
} from './stockAvailability/stockAvailability'

export const resolvers = {
  ...searchFieldResolvers,
  Query: {
    ...searchQueries,
    ...priceQueries,
    ...stockAvailabilityQueries,
  },
}
