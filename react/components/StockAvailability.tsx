import React from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'

import GET_STOCK_AVAILABILITY from '../queries/getStockAvailability.gql'

import { getFormattedDate } from '../utils'

import './ItemPricing.css'

const CSS_HANDLES = [
  'itemAvailability',
  'availableQuantity',
  'availableQuantity',
  'availableLabel',
]

interface Props {
  itemNumber: string
  customerNumber: string
}

const StockAvailability = ({ itemNumber, customerNumber }: Props) => {
  const styles = useCssHandles(CSS_HANDLES)

  const date = getFormattedDate(new Date())
  console.log(date)

  const { data: stockAvailabilityInfo, loading } = useQuery(
    GET_STOCK_AVAILABILITY,
    {
      skip: !itemNumber || itemNumber === '' || customerNumber === '',
      variables: {
        itemNumber: 'AD42BS', //itemNumber,
        customer: '20061', //customerNumber
        thruDate: '01/31/2022',//date,
      },
    }
  )

  // TODO: Remove this when we get live data
  const stockAvailability1 = 100

  const stockAvailability = parseInt(
    stockAvailabilityInfo?.getStockAvailability?.qtyAvailable ?? '0', 10
  )

  const primaryUoM =
    stockAvailabilityInfo?.getStockAvailability?.primaryUoM ?? ''

  return loading ? (
    <div className={`${styles.itemAvailability}`}>Loading...</div>
  ) : stockAvailability1 > 0 ? (
    <div className={`${styles.itemAvailability}`}>
      <span className={`${styles.availableQuantity} f3 mr2`}>{stockAvailability}</span>
      <span className={`${styles.availableQuantity} f3 mr3`}>{primaryUoM}</span>
      <span className={`${styles.availableLabel} f6 ttu`}>Available</span>
    </div>
  ) : (
    <div />
  )
}

export default StockAvailability
