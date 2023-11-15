function removeSquareBrackets(inputString:string) {
  return inputString.replace(/[\[\]]/g, '');
}


export async function getCustomerPartNumbers(itemNumber: string): Promise<any>{
  const decoredItemNumber = decodeURIComponent(itemNumber)
  const globalRegex = /^(\[.*\]|[^[\]]+)$/;

  if (!globalRegex.test(decoredItemNumber)){
    return{
      type: '',
      id: '',
      error: 'Invalid Pattern'
    }
  }

  const regex = /\[.*\]/


  const containsSquareBrackets = regex.test(decoredItemNumber);
  if (containsSquareBrackets){
     const customerPartNumber = removeSquareBrackets(decoredItemNumber)
     return {
        type: 'withCustomerPart',
        id: customerPartNumber,
        error: null
     }
  }
  return {
    type: 'withRefId',
    id: itemNumber,
    error: null
  }
}
