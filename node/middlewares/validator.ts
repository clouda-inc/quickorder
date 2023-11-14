export async function Validator(ctx: Context, customer:string, itemNumber: string): Promise<any>{
  const {
    clients: { customerSkuMasterData },
  } = ctx

  const regex = /\[.*\]/
  const decoredItemNumber = decodeURIComponent(itemNumber)

  const containsSquareBrackets = regex.test(decoredItemNumber);
  if (containsSquareBrackets){
     const customerPartNumber = removeSquareBrackets(decoredItemNumber)
     const where = `customerSku=${customerPartNumber} AND customerNumber=${customer}`
     const res  = await customerSkuMasterData.searchCustomerSKUDocuments(where)
     const skuRefId = res.length > 0 ? encodeURIComponent(res[0].skuRefId) : 'NA'
     return {
        skuRefId,
        customerPartNumber,
        customer
     }
  }
  const skuRefId = itemNumber
  const where = `skuRefId=${skuRefId} AND customerNumber=${customer}`
  const res  = await customerSkuMasterData.searchCustomerSKUDocuments(where)
  const customerPartNumber = res.length > 0 ? res[0]?.customerSku : 'NA'
  return {
    skuRefId,
    customer,
    customerPartNumber
  }
}

function removeSquareBrackets(inputString:string) {
  return inputString.replace(/[\[\]]/g, '');
}
