/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { UserInputError } from '@vtex/api'

import { resolvers as refidsResolvers } from './refids'
import {
  BRAND_CLIENT_ACRONYM,
  BRAND_CLIENT_SCHEMA,
  BRNAD_CLIENT_FIELDS,
  PLANT_ACRONYM,
  PLANT_FIELDS,
  PLANT_SCHEMA,
  // UMMOQ_CLIENT_ACRONYM,
  // UMMOQ_CLIENT_FIELDS,
  // UMMOQ_CLIENT_SCHEMA,
} from '../../utils/consts'

export const fieldResolvers = {
  ...refidsResolvers,
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: { refids: [string]; orderFormId: string },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { search },
    } = ctx

    if (!args.refids) {
      throw new UserInputError('No refids provided')
    }

    const items = await search.skuFromRefIds({
      refids: args.refids,
      orderFormId: args.orderFormId,
    })

    return {
      cacheId: args.refids,
      items,
    }
  },
  sellers: async (_: any, __: any, ctx: Context): Promise<any> => {
    const {
      clients: { search },
    } = ctx

    const items = await search.sellers()

    return {
      cacheId: 'sellers',
      items,
    }
  },
  getSkuAvailability: async (
    _: any,
    args: {
      refIds: string[]
      customerNumber: string
      targetSystem: string
      salesOrganizationCode: string
    },
    ctx: Context
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    // TODO: Remove this Line
    const performanceArray = [] as KeyValue[]

    performanceArray.push({
      key: 'REQUEST_START',
      value: Date.now().toString(),
    })

    const { refIds, customerNumber, targetSystem, salesOrganizationCode } = args
    const {
      clients: { search, masterdata, catalog },
    } = ctx

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Get Skus by RefIds',
      value: Date.now().toString(),
    })

    const skuIds = await search.getSkusByRefIds(refIds)

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Pre Process SKUs into objects',
      value: Date.now().toString(),
    })

    const refIdsFound = Object.getOwnPropertyNames(skuIds)
    const skus = refIdsFound
      .map((rfId: any) => ({
        skuId: skuIds[rfId],
        refId: rfId,
      }))
      .filter((sku: any) => sku.skuId != null)

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Get All Products by sku Ids',
      value: Date.now().toString(),
    })

    const products = await Promise.all(
      skus.map(async (sku: any) => search.searchProductBySkuId(sku.skuId))
    )

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Get All plants for sales organizations',
      value: Date.now().toString(),
    })

    const plants = await Promise.all(
      refIds.map((refId: string) => {
        const where = `skuRefId=${refId} ${
          salesOrganizationCode
            ? `AND salesOrganizationCode=${salesOrganizationCode}`
            : ''
        }`

        return masterdata.searchDocumentsWithPaginationInfo<SalesOrgPlant>({
          dataEntity: PLANT_ACRONYM,
          schema: PLANT_SCHEMA,
          fields: PLANT_FIELDS,
          where,
          pagination: { pageSize: 100, page: 1 },
        })
      })
    )

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Pre process plants data',
      value: Date.now().toString(),
    })

    const plantList = refIds.map((refId: string, index: number) => {
      return {
        refId,
        plants: plants[index]?.data ?? [],
      }
    })

    performanceArray.push({
      key: 'START Get Brand Info',
      value: Date.now().toString(),
    })
    const brands = await masterdata.searchDocumentsWithPaginationInfo<
      BrandForClients
    >({
      dataEntity: BRAND_CLIENT_ACRONYM,
      schema: BRAND_CLIENT_SCHEMA,
      fields: BRNAD_CLIENT_FIELDS,
      where: `(user=${customerNumber ?? ''} AND targetSystem=${targetSystem ??
        ''})`,
      pagination: { pageSize: 100, page: 1 },
    })

    const brandsList = brands?.data ?? []

    // TODO: Remove this line
    performanceArray.push({
      key: 'START All Inventory by ItemIds',
      value: Date.now().toString(),
    })

    const allInventoryByItemIds = await Promise.all(
      ((Object.values(skuIds ?? {}) as string[]) ?? []).map((skuId: string) => {
        return catalog.inventoryBySkuId(skuId)
      })
    )

    // TODO: Remove this line
    performanceArray.push({
      key: 'START for each product find availability',
      value: Date.now().toString(),
    })

    const allSkus = (products ?? [])
      .filter((r: any) => Object.entries(r).length > 0)
      .map((product: any) => {
        if (
          (product.items ?? []).length === 0 ||
          (product.items[0]?.sellers ?? []).length === 0
        ) {
          return {}
        }

        const { items, productId, productName } = product

        // One item has one sku
        const skuItem = items[0]
        const itemId = skuItem?.itemId
        const skuRefId = (skus ?? []).find((sku: any) => sku.skuId === itemId)
          ?.refId

        // const refId = (items[0]?.referenceId ?? []).find((ref: any) => ref.Key === 'RefId')?.Value ?? ''
        const { commertialOffer, sellerId, sellerName } = items[0].sellers[0]

        let availableQuantity = 0
        let isAuthorized = false

        if (targetSystem.toUpperCase() === 'SAP') {
          const productPlants =
            (plantList ?? [])
              .find(
                (plant: any) =>
                  plant?.refId?.toLowerCase() === skuRefId.toLowerCase()
              )
              ?.plants?.map((plant: any) => plant.plant) ?? []

          const selectedProductWearhouses =
            (allInventoryByItemIds ?? [])
              .find((inventory: any) => inventory.skuId === itemId)
              ?.balance?.filter((wearhouse: any) =>
                productPlants.includes(wearhouse.warehouseName)
              ) ?? []

          availableQuantity = selectedProductWearhouses.reduce(
            (partialSum: number, current: { totalQuantity: number }) =>
              partialSum + current?.totalQuantity ?? 0,
            0
          )
          isAuthorized = selectedProductWearhouses.length > 0
        } else if (targetSystem.toUpperCase() === 'JDE') {
          const { AvailableQuantity } = commertialOffer

          const productBrand = product.brand
          // const brandClientData = brandData?.brandClient?.data ?? []
          const brandDataMatch: any = (brandsList ?? []).find(
            (data: any) => data.trade === productBrand
          )

          availableQuantity =
            brandDataMatch?.trade === productBrand ? AvailableQuantity : 0
          isAuthorized = brandDataMatch?.trade === productBrand
        }

        const price = commertialOffer.SellingPrice
          ? commertialOffer.SellingPrice
          : commertialOffer.Price
          ? commertialOffer.Price
          : commertialOffer.ListPrice

        const uomKey =
          targetSystem.toUpperCase() === 'SAP'
            ? 'Unit of Measure'
            : 'JDE Unit of Measure'

        const uomDescriptionKey =
          targetSystem.toUpperCase() === 'SAP'
            ? 'UOM_Description'
            : 'JDE Unit of Measure Description'

        const moqKey =
          targetSystem.toUpperCase() === 'SAP'
            ? 'Minimum Order Quantity'
            : 'JDE Minimum Order Quantity'

        const leadTimeKey =
          targetSystem.toUpperCase() === 'SAP'
            ? 'Material_Master_Lead_Time'
            : 'JDE_Lead_Time'

        const uom = (product[uomKey] ?? []).find((i: string) => i && i !== '')

        const uomDescription = (product[uomDescriptionKey] ?? []).find(
          (i: string) => i && i !== ''
        )

        const moq =
          (product[moqKey] ?? []).find((i: string) => i && i !== '') ?? '1'

        const leadTime = (product[leadTimeKey] ?? []).find(
          (i: string) => i && i !== ''
        )

        const unitMultiplier = skuItem?.unitMultiplier ?? 1

        return {
          refid: skuRefId,
          sku: itemId,
          productId,
          productName,
          skuName: skuItem?.name,
          uom,
          uomDescription,
          moq,
          leadTime,
          linkText: product.linkText,
          price,
          availableQuantity,
          seller: {
            id: sellerId,
            name: sellerName,
          },
          availability: isAuthorized ? 'authorized' : 'unauthorized',
          unitMultiplier,
        }
      })

    // TODO: Remove this line
    performanceArray.push({
      key: 'START Processed SKU Item mappings',
      value: Date.now().toString(),
    })

    const itemsRequested = (refIds ?? []).map((refId: string) => {
      const existing = allSkus.find((s: any) => s.refid === refId)

      return (
        existing || {
          refid: refId,
          sku: null,
          productId: null,
          productName: null,
          skuName: null,
          uom: null,
          uomDescription: null,
          moq: null,
          leadTime: null,
          linkText: null,
          price: null,
          availableQuantity: null,
          seller: null,
          availability: 'unavailable',
        }
      )
    })

    // TODO: Remove this line
    performanceArray.push({
      key: 'BEFORE Sending Response',
      value: Date.now().toString(),
    })

    return {
      items: itemsRequested,
      performanceData: performanceArray,
    }
  },
}
