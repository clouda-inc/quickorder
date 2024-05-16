import React, { useState, useContext, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import getSymbolFromCurrency from 'currency-symbol-map'
import { Modal } from 'vtex.styleguide'
import { useIntl, defineMessages } from 'react-intl'

import GET_ITEM_PRICING from '../queries/getItemPricing.gql'
import { getFormattedDate } from '../utils'
import { TableDataContext } from '../utils/context'
import type { TableData } from '../utils/context'

import './ItemPricing.css'

const CSS_HANDLES = [
  'priceTable',
  'priceTableHeader',
  'priceTableRow',
  'priceTableHeaderQty',
  'priceTableHeaderPrice',
  'priceTableRowQty',
  'priceTableRowPrice',
]

const messages = defineMessages({
  price: {
    id: 'store/quickorder.item-price.price',
    defaultMessage: 'PRICE',
  },
  more: {
    id: 'store/quickorder.item-price.more',
    defaultMessage: 'more...',
  },
  loading: {
    id: 'store/quickorder.item-price.loading',
    defaultMessage: 'loading...',
  },
  qty: {
    id: 'store/quickorder.item-price.qty',
    defaultMessage: 'QTY',
  },
  completePrice: {
    id: 'store/quickorder.item-price.complete-price',
    defaultMessage: 'Complete Pricing',
  },
})

interface Props {
  itemNumber: string
  customerNumber: string
  branch: string
}

const ItemPricing = ({ itemNumber, customerNumber, branch }: Props) => {
  const styles = useCssHandles(CSS_HANDLES)
  const [isOpen, setIsOpen] = useState(false)
  const intl = useIntl()
  const { handleExtractData } = useContext(TableDataContext) as TableData

  const {
    data: itemPricingInfo,
    loading,
    refetch,
  } = useQuery(GET_ITEM_PRICING, {
    skip: !itemNumber || itemNumber === '',
    variables: {
      itemNumber,
      customer: customerNumber,
      effectiveDate: getFormattedDate(new Date()),
      branch,
    },
  })

  const priceList = itemPricingInfo?.getItemPricing?.itemPrices ?? []

  const uomSuffixForTitles =
    priceList && priceList.length > 0 && priceList[0].uom
      ? ` (${priceList[0].uom})`
      : ''

  const openModal = () => {
    setIsOpen(true)
  }

  const refetchPriceListAndUpdateContext = async () => {
    const { data } = await refetch()
    const priceList = data?.getItemPricing?.itemPrices ?? []

    handleExtractData(itemNumber, priceList, 'priceList')
  }

  useEffect(() => {
    if (!loading) {
      console.log('adding price list to context')
      handleExtractData(itemNumber, priceList, 'priceList')
    }
    refetchPriceListAndUpdateContext()
  }, [priceList])

  return loading ? (
    <div className={`${styles.priceTable}`}>
      {intl.formatMessage(messages.loading)}
    </div>
  ) : (
    <div className={`${styles.priceTable} flex flex-column`}>
      <div className={`${styles.priceTableHeader} flex w-100`}>
        <div className={`${styles.priceTableHeaderQty} flex mr3 w-60 b`}>
          {intl.formatMessage(messages.qty)} {uomSuffixForTitles}
        </div>
        <div className={`${styles.priceTableHeaderPrice} flex w-40 b mr3`}>
          {intl.formatMessage(messages.price)} {uomSuffixForTitles}
        </div>
      </div>
      {priceList.map((item: ItemPrices, index: number) => {
        return index < 3 ? (
          <div
            key={`${item?.itemNumber}-${index}-${item.price}`}
            className={`${styles.priceTableRow} flex w-100`}
          >
            <div className={`${styles.priceTableRowQty} flex mr3 w-60`}>
              {item.quantity}
            </div>
            <div className={`${styles.priceTableRowPrice} flex w-40 mr3`}>
              {`${getSymbolFromCurrency(item?.currency)}${item.price}`}
            </div>
          </div>
        ) : (
          index === 3 && (
            <div
              role="button"
              className={`${styles.priceTableMoreLink} b f7 pointer`}
              onClick={openModal}
              onKeyDown={openModal}
              tabIndex={0}
            >
              {intl.formatMessage(messages.more)}
            </div>
          )
        )
      })}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={intl.formatMessage(messages.completePrice)}
      >
        <div className={`${styles.priceTableModal}`}>
          <div className={`${styles.priceTableHeader} flex w-100`}>
            <div className={`${styles.priceTableHeaderQty} flex mr3 w-60 b`}>
              {intl.formatMessage(messages.qty)} {uomSuffixForTitles}
            </div>
            <div className={`${styles.priceTableHeaderPrice} flex w-40 b mr3`}>
              {intl.formatMessage(messages.price)} {uomSuffixForTitles}
            </div>
          </div>
          {priceList.map((item: ItemPrices) => {
            return (
              <div
                key={item?.itemNumber}
                className={`${styles.priceTableRow} flex w-100`}
              >
                <div className={`${styles.priceTableRowQty} flex mr3 w-60`}>
                  {item.quantity}
                </div>
                <div className={`${styles.priceTableRowPrice} flex w-40 mr3`}>
                  {`${getSymbolFromCurrency(item?.currency)}${item.price}`}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

export default ItemPricing
