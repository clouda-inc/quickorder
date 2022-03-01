import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import getSymbolFromCurrency from 'currency-symbol-map'
import { Modal } from 'vtex.styleguide'

import GET_ITEM_PRICING from '../queries/getItemPricing.gql'

import { getFormattedDate } from '../utils'

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

interface Props {
  itemNumber: string
  customerNumber: string
}

const ItemPricing = ({ itemNumber, customerNumber }: Props) => {
  const styles = useCssHandles(CSS_HANDLES)
  const [isOpen, setIsOpen] = useState(false)

  const { data: itemPricingInfo, loading } = useQuery(GET_ITEM_PRICING, {
    skip: !itemNumber || itemNumber === '',
    variables: {
      itemNumber: itemNumber,
      customer: customerNumber,
      effectiveDate: getFormattedDate(new Date()),
    },
  })

  const priceList = itemPricingInfo?.getItemPricing?.itemPrices ?? []

  const openModal = () => {
    setIsOpen(true)
  }

  return loading ? (
    <div className={`${styles.priceTable}`}>Loading...</div>
  ) : (
    <div className={`${styles.priceTable} flex flex-column`}>
      <div className={`${styles.priceTableHeader} flex w-100`}>
        <div className={`${styles.priceTableHeaderQty} flex mr3 w-60 b`}>
          QTY
        </div>
        <div className={`${styles.priceTableHeaderPrice} flex w-40 b mr3`}>
          PRICE
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
        ) :  index === 3 && (
          <div
            role="button"
            className={`${styles.priceTableMoreLink} b f7 pointer`}
            onClick={openModal}
            onKeyDown={openModal}
            tabIndex={0}
          >
            more...
          </div>
        )
      })}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Complete Pricing`}
      >
        <div className={`${styles.priceTableModal}`}>
          <div className={`${styles.priceTableHeader} flex w-100`}>
            <div className={`${styles.priceTableHeaderQty} flex mr3 w-60 b`}>
              QTY
            </div>
            <div className={`${styles.priceTableHeaderPrice} flex w-40 b mr3`}>
              PRICE
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
