import { UserInputError, NotFoundError } from '@vtex/api'

export const queries = {
  getBrandInfoBySkyRefId: async (
    _: any,
    args: { skuRefId: string; brandNameToCompare?: string },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { catalog },
    } = ctx

    if (!args.skuRefId) {
      throw new UserInputError('No refids provided')
    }

    let skuContextResponse = null

    try {
      skuContextResponse = await catalog.getSkuContextByRefId(args.skuRefId)
    } catch (error) {
      console.error(error)
    }

    return {
      brandName: skuContextResponse?.name ?? '',
      brandId: skuContextResponse?.id ?? '',
      isSameBrand: args?.brandNameToCompare
        ? args.brandNameToCompare.toUpperCase() ===
          skuContextResponse?.name?.toUpperCase()
        : undefined,
    }
  },

  getProductSpecificationByName: async (
    _: any,
    args: { skuRefId: string; skuSpecName: string },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { catalog },
    } = ctx

    if (!args.skuRefId || !args.skuSpecName) {
      throw new UserInputError('No refid/specification provided')
    }

    let productSpecResponse = null

    try {
      productSpecResponse = await catalog.getSpecificationByName(
        args.skuRefId,
        args.skuSpecName
      )
    } catch (error) {
      console.error(error)
      throw new NotFoundError(error)
    }

    return {
      spec: args.skuSpecName,
      value: productSpecResponse ?? [],
    }
  },
}
