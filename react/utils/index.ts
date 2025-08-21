import GET_SKU_REFID_WITH_CUSTOMER_PART_NUMBER from '../queries/getSkuRefIdWithCustomerpart.graphql'
import GET_BRAND_DETAILS_BY_SKU_REFID from '../queries/getBrandInfoBySkyRefId.graphql'
import GET_PRODUCT_SPECIFICATION_BY_NAME from '../queries/getProductSpecificationByName.graphql'
import { TARGET_SYSTEM } from './const'

const RESTRICTED_BRAND_SPIRALOCK = 'SPIRALOCK'
const RESTRICTED_BRAND_SWS_SPARES = 'SWS SPARES'
const SPEC_JDE_LEAD_TIME_DAYS = 'JDE_Lead_Time_Days'
const SPEC_MADE_TO_ORDER = 'JDE_MTO'

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

export const getFormattedDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (1 + date.getMonth()).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${month}/${day}/${year}`
}

export const getRefIdWithCustomerpart = async (
  partNumber: string,
  customerNumber: string,
  client: any,
  targetSystem: string
) => {
  const query = {
    query: GET_SKU_REFID_WITH_CUSTOMER_PART_NUMBER,
    variables: {
      partNumber,
      customerNumber,
      targetSystem,
    },
  }

  const { data } = await client.query(query)

  if (data) {
    return {
      skuRefId: data.getSkuRefIdWithCustomerPart.refId,
      customerPartNumber: data.getSkuRefIdWithCustomerPart.customerPartNumber,
      error: data.getSkuRefIdWithCustomerPart.error,
    }
  }

  return {
    skuRefId: '',
    customerPartNumber: '',
    error: 'No data Available',
  }
}

export const getBrandRestrictions = async (
  skuRefId: string,
  client: any,
  brandNameToCompare?: string
) => {
  const query = {
    query: GET_BRAND_DETAILS_BY_SKU_REFID,
    variables: {
      skuRefId,
      brandNameToCompare,
    },
  }

  const { data } = await client.query(query)

  if (data) {
    return {
      isSameBrand: data.getBrandInfoBySkyRefId?.isSameBrand,
    }
  }

  return {
    isSameBrand: undefined,
  }
}

export const getProductThruDate = async (
  refId: string,
  client: any,
  productSpecName: string
) => {
  const query = {
    query: GET_PRODUCT_SPECIFICATION_BY_NAME,
    variables: {
      refId,
      productSpecName,
    },
  }

  const { data } = await client.query(query)

  const today = new Date()

  if (
    data?.getProductSpecificationByName?.value &&
    data.getProductSpecificationByName?.value?.length > 0
  ) {
    const diff =
      data.getProductSpecificationByName.value[0] &&
      // eslint-disable-next-line no-restricted-globals
      !isNaN(data.getProductSpecificationByName.value[0])
        ? parseInt(data.getProductSpecificationByName.value[0], 10)
        : 0

    today.setDate(today.getDate() + diff)
  }

  return getFormattedDate(today)
}

export const getMadeToOrder = async (refId: string, client: any) => {
  const query = {
    query: GET_PRODUCT_SPECIFICATION_BY_NAME,
    variables: {
      refId,
      productSpecName: SPEC_MADE_TO_ORDER,
    },
  }

  const { data } = await client.query(query)

  return (
    data?.getProductSpecificationByName?.value &&
    data.getProductSpecificationByName.value?.length > 0 &&
    data.getProductSpecificationByName.value[0].toUpperCase() === 'YES'
  )
}

/**
 *
 * @param textAreaValue
 * @constructor
 */
export const ParseText = async (
  textAreaValue: string,
  client: any,
  customerNumber: string,
  targetSystem: string
) => {
  const rawText: any = String(textAreaValue || '')
  const arrText = String(rawText).split(/[\n\r]/)
  const items = arrText
    .filter((item: any) => {
      return String(item).trim() !== ''
    })
    .map(async (line: any, index: number) => {
      const lineSplitted: any = line.split(',')

      if (lineSplitted.length === 1 || lineSplitted.length === 2) {
        const skuReference = String(lineSplitted[0]).trim()
        const quantity = Number(
          lineSplitted.length === 2 ? String(lineSplitted[1]).trim() : '1'
        )

        if (
          !!skuReference &&
          skuReference.length > 0 &&
          // eslint-disable-next-line no-restricted-globals
          !isNaN(quantity) &&
          quantity > 0
        ) {
          const { skuRefId, customerPartNumber, error } =
            await getRefIdWithCustomerpart(
              skuReference,
              customerNumber,
              client,
              targetSystem
            )

          if (error) {
            return {
              index,
              line: index,
              content: line,
              sku: '',
              quantity: null,
              error:
                error === 'No Ref_ID'
                  ? 'store/quickorder.invalidCustomerPart'
                  : error === 'No customerPart'
                  ? 'store/quickorder.invalidRefId'
                  : 'store/quickorder.invalidPattern',
              partNumber: '',
              branch: '',
              thruDate: '',
              mto: false,
            }
          }

          // Check for SPIRALOCK brand
          const { isSameBrand: isSpiraLockItem } = await getBrandRestrictions(
            skuRefId,
            client,
            RESTRICTED_BRAND_SPIRALOCK
          )

          // Check for SWS SPARES brand
          const { isSameBrand: isSWSSparesItem } = await getBrandRestrictions(
            skuRefId,
            client,
            RESTRICTED_BRAND_SWS_SPARES
          )

          // Determine branch based on brand
          const getBranchCode = () => {
            if (isSpiraLockItem) return '6100'
            if (isSWSSparesItem) return '1100'

            return '2100' // Default branch for non-special brands
          }

          const thruDate =
            targetSystem === TARGET_SYSTEM.JDE
              ? await getProductThruDate(
                  skuRefId,
                  client,
                  SPEC_JDE_LEAD_TIME_DAYS
                )
              : ''

          const mto = await getMadeToOrder(skuRefId, client)

          return {
            index,
            line: index,
            // Add encoding to handle special characters in sku name , Due to encoding sku name might be changed inside the project
            sku: skuRefId,
            quantity,
            content: line,
            error: null,
            partNumber: customerPartNumber,
            branch: getBranchCode(),
            thruDate,
            mto,
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
        partNumber: '',
        branch: '',
        thruDate: '',
        mto: false,
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
export const itemsInSystem = (orderFormItems: any[], itemsList: any[]) => {
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
export const getNewItems = (orderFormItems: any[], itemsList: any[]) => {
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
