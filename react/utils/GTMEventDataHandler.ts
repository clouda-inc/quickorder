export const addToCartGTMEventData = (
  previousOrderFormItems: any,
  items: any,
  mutationResultsItems: any
) => {
  if (!items || !mutationResultsItems) {
    return null
  }

  const getCategories = (categories: any, id: number) => {
    const splittedCategories = Object.values(categories)

    return splittedCategories && splittedCategories.length > id
      ? splittedCategories[id]
      : undefined
  }

  return items
    .map((item: { id: number }) => {
      const mutationItem =
        mutationResultsItems.find(
          (e: { id: string }) => e.id === item.id.toString()
        ) ?? null

      const orderFormItem = previousOrderFormItems
        ? previousOrderFormItems.find(
            (e: { id: string }) => e.id === item.id.toString()
          ) ?? null
        : null

      if (!mutationItem) {
        return null
      }

      return {
        item_id: mutationItem?.refId
          ? mutationItem.refId
          : orderFormItem?.refId
          ? orderFormItem.refId
          : undefined,
        item_name: mutationItem?.name
          ? mutationItem.name
          : orderFormItem?.name
          ? orderFormItem.name
          : undefined,
        item_category: mutationItem?.productCategories
          ? getCategories(mutationItem.productCategories, 0)
          : orderFormItem?.productCategories
          ? getCategories(orderFormItem.productCategories, 0)
          : undefined,
        item_category2: mutationItem?.productCategories
          ? getCategories(mutationItem.productCategories, 1)
          : orderFormItem?.productCategories
          ? getCategories(orderFormItem.productCategories, 1)
          : undefined,
        item_category3: mutationItem?.productCategories
          ? getCategories(mutationItem.productCategories, 2)
          : orderFormItem?.productCategories
          ? getCategories(orderFormItem.productCategories, 2)
          : undefined,
        item_category4: mutationItem?.productCategories
          ? getCategories(mutationItem.productCategories, 3)
          : orderFormItem?.productCategories
          ? getCategories(orderFormItem.productCategories, 3)
          : undefined,
        item_category5: mutationItem?.productCategories
          ? getCategories(mutationItem.productCategories, 4)
          : orderFormItem?.productCategories
          ? getCategories(orderFormItem.productCategories, 4)
          : undefined,
        quantity:
          mutationItem?.quantity && mutationItem.unitMultiplier
            ? mutationItem.quantity * mutationItem.unitMultiplier -
              (orderFormItem?.quantity && orderFormItem.unitMultiplier
                ? orderFormItem.quantity * orderFormItem.unitMultiplier
                : 0)
            : 1,
      }
    })
    .filter((e: any) => !!e)
}
