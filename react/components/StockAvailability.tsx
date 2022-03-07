import React, { useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'

import GET_STOCK_AVAILABILITY from '../queries/getStockAvailability.gql'
import { getFormattedDate } from '../utils'
import ItemListContext from '../ItemListContext'

import './ItemPricing.css'

const CSS_HANDLES = [
  'itemAvailability',
  'availableQuantity',
  'availableQuantity',
  'availableLabel',
]

interface Props {
  itemIndex: number
  itemNumber: string
  customerNumber: string
}

const StockAvailability = ({
  itemIndex,
  itemNumber,
  customerNumber,
}: Props) => {
  const styles = useCssHandles(CSS_HANDLES)
  const { useItemListDispatch } = ItemListContext

  const dispatch = useItemListDispatch()

  const { data: stockAvailabilityInfo, loading } = useQuery(
    GET_STOCK_AVAILABILITY,
    {
      skip: !itemNumber || itemNumber === '' || customerNumber === '',
      variables: {
        itemNumber,
        customer: customerNumber,
        thruDate: getFormattedDate(new Date()),
      },
    }
  )

  const stockAvailability = parseInt(
    stockAvailabilityInfo?.getStockAvailability?.qtyAvailable ?? '0',
    10
  )

  useEffect(() => {
    dispatch({
      type: 'SET_ITEM_AVAILABILITY',
      args: {
        itemStatus: {
          index: itemIndex,
          sku: itemNumber,
          error: '',
          availability: '',
          availableQuantity: stockAvailability,
          isQuantityLoading: loading,
        },
      },
    })
  }, [stockAvailability, itemIndex, itemNumber, loading, dispatch])

  const primaryUoM =
    stockAvailabilityInfo?.getStockAvailability?.primaryUoM ?? ''

  return loading ? (
    <div className={`${styles.itemAvailability}`}>Loading...</div>
  ) : stockAvailability > 0 ? (
    <div className={`${styles.itemAvailability}`}>
      <span className={`${styles.availableQuantity} f3 mr2`}>
        {stockAvailability}
      </span>
      <span className={`${styles.availableQuantity} f3 mr3`}>{primaryUoM}</span>
      <span className={`${styles.availableLabel} f6 ttu`}>Available</span>
    </div>
  ) : (
    <div />
  )
}

export default StockAvailability
