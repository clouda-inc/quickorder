// Add brands' names in UPPERCASE //
export const RESTRICTED_BRANDS = ['SPIRALOCK', 'SWS SPARES']
export const DEFAULT_STATE = 'DEFAULT'
export const INVALID_STATE = 'INVALID'
export const EMPTY_CART = 'ZERO'

export const isValidToAddItems = (
  brandsOfCartItems: string[],
  brandsOfNewItems: string[]
) => {
  console.log('inputs >>>> ', brandsOfCartItems, brandsOfNewItems)

  if (brandsOfNewItems?.length === 0) {
    return false
  }

  const cartState =
    brandsOfCartItems?.length === 0
      ? EMPTY_CART
      : !brandsOfCartItems?.some((brand) =>
          RESTRICTED_BRANDS?.includes(brand.toUpperCase())
        )
      ? DEFAULT_STATE
      : brandsOfCartItems?.[0].toUpperCase()

  const uniqueBrandsOfNewItems = [
    ...new Set(brandsOfNewItems.map((brand) => brand.toUpperCase())),
  ]

  const newItemsState =
    uniqueBrandsOfNewItems?.length === 1
      ? RESTRICTED_BRANDS?.includes(uniqueBrandsOfNewItems[0])
        ? uniqueBrandsOfNewItems[0]
        : DEFAULT_STATE
      : uniqueBrandsOfNewItems?.some((brand) =>
          RESTRICTED_BRANDS?.includes(brand.toUpperCase())
        )
      ? INVALID_STATE
      : DEFAULT_STATE

  console.log('cartState >>>> ', cartState)
  console.log('uniqueBrandsOfNewItems >>>> ', uniqueBrandsOfNewItems)
  console.log('newItemsState >>>> ', newItemsState)

  return (
    newItemsState !== INVALID_STATE &&
    (cartState === EMPTY_CART || cartState === newItemsState)
  )
}
