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

      // TODO: Remove these commented lines
      // const jsonRes = `{"items": [{"Adjustment" : "CSA","C/B" :"","Curr" : "USD","CustGrp" : "126","Customer" : "20061","Effective" : "2021-12-15","Item": "AD42BS","Price": "11.462706","Quantity": "1000","UoM": "M"},{"Adjustment" : "CSA","C/B" :"","Curr" : "USD","CustGrp" : "126","Customer" : "20061","Effective" : "2021-12-15","Item": "AD42BS","Price": "10.316078","Quantity": "250000","UoM": "M"},{"Adjustment" : "CSA","C/B" :"","Curr" : "USD","CustGrp" : "126","Customer" : "20061","Effective" : "2021-12-15","Item": "AD42BS","Price": "10.057431","Quantity": "500000","UoM": "M"},{"Adjustment" : "CSA","C/B" :"","Curr" : "USD","CustGrp" : "126","Customer" : "20061","Effective" : "2021-12-15","Item": "AD42BS","Price": "9.628339","Quantity": "1000000","UoM": "M"}]}`
      // const pricingInfo = JSON.parse(jsonRes)

      const prices = (priceResponse?.items ?? ([] as any)).map((item: any) => ({
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
      }))

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
