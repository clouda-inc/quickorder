import { UserInputError } from '@vtex/api'

const stringToNumber = (numberToFormat: string, decimalPoints: number) => {
  return numberToFormat != null && numberToFormat !== ''
    ? parseFloat(numberToFormat).toFixed(decimalPoints).toString()
    : '0.00'
}

export const queries = {
  getItemPricing: async (
    _: any,
    args: {
      customer: string
      itemNumber: string
      effectiveDate: string
      branch: string
    },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { customPricing, apps },
    } = ctx

    if (!args.itemNumber) {
      throw new UserInputError('No refids provided')
    }

    const settings: AppSettings = await apps.getAppSettings(
      process.env.VTEX_APP_ID ?? ''
    )

    try {
          const priceResponse = await customPricing.getItemPricing(
            {
              Customer: args.customer,
              Item_Number: args.itemNumber,
              Effective_Date: args.effectiveDate,
              Branch: args.branch,
            },
            settings
          )

          const prices = (priceResponse?.items ?? ([] as any)).map(
            (item: any) => ({
              adjustment: item?.Adjustment,
              cB: item ? item['C/B'] : '',
              currency: item?.Curr,
              customerGroup: item?.CustGrp,
              customer: item?.Customer,
              effectiveDate: item?.Effective,
              itemNumber: item?.Item,
              price: stringToNumber(item?.Price, 2),
              quantity: item?.Quantity,
              uom: item?.UoM,
            })
          )

          return {
            itemPrices: prices,
          }
        } catch (err) {
      console.log('error >>>', err)
      return {
        itemPrices: [],
      }
    }
  },
}
