import { UserInputError } from '@vtex/api'

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

    const skuContextResponse = await catalog.getSkuContextByRefId(args.skuRefId)

    return {
      brandName: skuContextResponse?.BrandName ?? '',
      brandId: skuContextResponse?.BrandId ?? '',
      isSameBrand: args?.brandNameToCompare
        ? args.brandNameToCompare.toUpperCase() ===
          skuContextResponse?.BrandName?.toUpperCase()
        : undefined,
    }
  },
}
