import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { useIntl, defineMessages } from 'react-intl'

import GET_STOCK_AVAILABILITY from '../queries/getStockAvailability.gql'
import ItemListContext from '../ItemListContext'
import { TableDataContext } from '../utils/context'
import type { TableData } from '../utils/context'

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
  thruDate: string
}

const messages = defineMessages({
  available: {
    id: 'store/quickorder.stock-availablity.available',
    defaultMessage: 'available',
  },
  loading: {
    id: 'store/quickorder.stock-availablity.loading',
    defaultMessage: 'loading...',
  },
})

const StockAvailability = ({
  itemIndex,
  itemNumber,
  customerNumber,
  thruDate,
}: Props) => {
  const styles = useCssHandles(CSS_HANDLES)
  const intl = useIntl()
  const { useItemListDispatch } = ItemListContext
  const { handleExtractData } = useContext(TableDataContext) as TableData

  const dispatch = useItemListDispatch()

  const {
    data: stockAvailabilityInfo,
    loading,
    refetch,
  } = useQuery(GET_STOCK_AVAILABILITY, {
    skip: !itemNumber || itemNumber === '' || customerNumber === '',
    variables: {
      itemNumber,
      customer: customerNumber,
      thruDate,
    },
  })

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

  const refetchStockAvailabilityAndUpdateContext = async () => {
    const { data } = await refetch()
    const stockAvailability = parseInt(
      data?.getStockAvailability?.qtyAvailable ?? '0',
      10
    )

    handleExtractData(itemNumber, stockAvailability, 'stockAvailability')
  }

  useEffect(() => {
    if (!loading) {
      handleExtractData(itemNumber, stockAvailability, 'stockAvailability')
    }
    refetchStockAvailabilityAndUpdateContext()
  }, [])

  return loading ? (
    <div className={`${styles.itemAvailability}`}>
      {intl.formatMessage(messages.loading)}
    </div>
  ) : stockAvailability > 0 ? (
    <div className={`${styles.itemAvailability}`}>
      <span className={`${styles.availableQuantity} f3 mr2`}>
        {stockAvailability}
      </span>
      <span className={`${styles.availableQuantity} f3 mr3`}>{primaryUoM}</span>
      <span className={`${styles.availableLabel} f6 ttu`}>
        {intl.formatMessage(messages.available)}
      </span>
    </div>
  ) : (
    <div />
  )
}

export default StockAvailability
