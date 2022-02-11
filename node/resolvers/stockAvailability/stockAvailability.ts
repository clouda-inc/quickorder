import { UserInputError } from '@vtex/api'

const stringToNumber = (numberToFormat: string, decimalPoints: number) => {
  return numberToFormat != null && numberToFormat !== ''
    ? parseFloat(numberToFormat).toFixed(decimalPoints).toString()
    : '0.00'
}

export const queries = {
  getStockAvailability: async (
    _: any,
    args: { customer: string; itemNumber: string; thruDate: string },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { customStockAvailability, apps },
    } = ctx

    if (!args.itemNumber) {
      throw new UserInputError('No item numbers provided')
    }

    const settings: AppSettings = await apps.getAppSettings(
      process.env.VTEX_APP_ID ?? ''
    )

    const availabilityResponse =
      await customStockAvailability.getStockAvailability(
        {
          Customer: args.customer,
          ItemNumber: args.itemNumber,
          Thru_Date: args.thruDate,
        },
        settings
      )

    return {
      itemNumber: availabilityResponse?.ItemNumber,
      customer: availabilityResponse?.Customer,
      thruDate: availabilityResponse?.Thru_Date,
      primaryUoM: availabilityResponse?.PrimaryUoM,
      pricingUoM: availabilityResponse?.PricingUoM,
      branchPlant: availabilityResponse?.BranchPlant,
      demand: availabilityResponse?.Demand,
      supply: availabilityResponse?.Supply,
      promiseDate: availabilityResponse?.PromiseDate,
      qtyAvailable: stringToNumber(availabilityResponse?.QtyAvailable, 0),
    }
  },
}
