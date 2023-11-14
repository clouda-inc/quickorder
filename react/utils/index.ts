import GET_SKU_REFID_WITH_CUSTOMER_PART_NUMBER from '../queries/getSkuRefIdWithCustomerpart.graphql'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const GetText = (items: any) => {
  const joinLines = items
    .map((line: any) => {
      return line.content
    })
    .join('\n')

  return joinLines
}

const removeDuplicates = (itemList: any) => {
  const map = new Map()

  itemList.forEach((item: any) => {
    const key = item.sku
    const collection = map.get(key)

    if (!collection) {
      map.set(key, item)
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      collection.quantity += item.quantity
      collection.content = `${key},${collection.quantity}`
    }
  })

  return Array.from(map, ([, value]) => value)
}

/**
 *
 * @param textAreaValue
 * @constructor
 */
export const ParseText = async (textAreaValue: string, client:any, customerNumber:string) => {

  const rawText: any = String(textAreaValue || '')
  const arrText = String(rawText).split(/[\n\r]/)
  const items = arrText
    .filter((item: any) => {
      return String(item).trim() !== ''
    })
    .map(async (line: any, index: number) => {
      const lineSplitted: any = line.split(',')

      if (lineSplitted.length === 2) {
        if (
          !!lineSplitted[0] &&
          !!String(lineSplitted[1]).trim() &&
          // eslint-disable-next-line no-restricted-globals
          !isNaN(lineSplitted[1])
        ) {
          const {skuRefId, customerPartNumber } = await getRefIdWithCustomerpart(String(lineSplitted[0]).trim(), customerNumber, client)

          return {
            index,
            line: index,
            // Add endording to handle special characters in sku name , Due to encording sku name might be changed inside the project
            sku: skuRefId,
            quantity: parseFloat(String(lineSplitted[1]).trim()),
            content: line,
            error: null,
            partNumber : customerPartNumber
          }
        }
      }

      return {
        index,
        line: index,
        content: line,
        sku: null,
        quantity: null,
        error: 'store/quickorder.invalidPattern',
        partNumber: ''
      }
    })
  const promises = await Promise.all(items)
  return removeDuplicates(promises)
}

/**
 *
 * @param orderFormItems
 * @param itemsList
 */
export const itemsInSystem = (orderFormItems, itemsList) => {
  return itemsList.filter((item: any) =>
    // eslint-disable-next-line eqeqeq
    orderFormItems.some((data: any) => data.id == item.id)
  )
}

/**
 *
 * @param orderFormItems
 * @param itemsList
 */
export const getNewItems = (orderFormItems, itemsList) => {
  return itemsList.filter(
    (item: any) =>
      // eslint-disable-next-line eqeqeq
      !orderFormItems.some((data: any) => data.id == item.id)
  )
}

export const validateQuantity = (minQty: number, unit: number, qty: number) => {
  qty = Math.round(qty / unit)

  const actualQty = qty * unit

  const quantity =
    minQty % unit === 0
      ? actualQty < minQty
        ? minQty
        : actualQty
      : actualQty < minQty
      ? minQty + (unit - (minQty % unit))
      : actualQty

  return quantity
}

export const getFormattedDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (1 + date.getMonth()).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${month}/${day}/${year}`
}


export const getRefIdWithCustomerpart = async(partNumber:string, customerNumber:string, client:any)=> {
    const query = {
      query: GET_SKU_REFID_WITH_CUSTOMER_PART_NUMBER,
      variables: {
        partNumber,
        customerNumber,
      },
    }

    const {data} = await client.query(query)

    if (data){
      return {
        skuRefId : data.getSkuRefIdWithCustomerPart.refId,
        customerPartNumber : data.getSkuRefIdWithCustomerPart.customerPartNumber
      }
    } else {
      return{
        skuRefId : '',
        customerPartNumber : ''
      }
    }
}
