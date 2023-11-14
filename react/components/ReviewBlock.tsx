/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vtex/prefer-early-return */
/* eslint no-shadow: "error" */
import React, {
  useState,
  FunctionComponent,
  useCallback,
  useEffect,
} from 'react'
import {
  ButtonWithIcon,
  IconDelete,
  // IconInfo,
  // Input,
  Table,
  Tooltip,
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'

import { GetText, validateQuantity } from '../utils'
import { TARGET_SYSTEM } from '../utils/const'
import { keyValuePairsToString } from '../utils/performanceDataProcessing'
import ItemPricing from './ItemPricing'
import StockAvailability from './StockAvailability'
import ItemListContext from '../ItemListContext'
import GET_PRODUCT_DATA from '../queries/getPrductAvailability.graphql'
import './ReviewBlock.css'

const remove = <IconDelete />

const messages = defineMessages({
  valid: {
    id: 'store/quickorder.valid',
  },
  available: {
    id: 'store/quickorder.available',
  },
  unavailable: {
    id: 'store/quickorder.unavailable',
  },
  unAuthorized: {
    id: 'store/quickorder.unauthorized',
  },
  unAuthorizedCatalogEU: {
    id: 'store/quickorder.unauthorized.catalog-eu',
  },
  unAuthorizedError: {
    id: 'store/quickorder.unauthorizedError',
  },
  invalidPattern: {
    id: 'store/quickorder.invalidPattern',
  },
  withoutStock: {
    id: 'store/quickorder.withoutStock',
  },
  skuNotFound: {
    id: 'store/quickorder.skuNotFound',
  },
  withoutPriceFulfillment: {
    id: 'store/quickorder.withoutPriceFulfillment',
  },
  cannotBeDelivered: {
    id: 'store/quickorder.cannotBeDelivered',
  },
  ORD002: {
    id: 'store/quickorder.ORD002',
  },
  ORD003: {
    id: 'store/quickorder.ORD003',
  },
  ORD004: {
    id: 'store/quickorder.ORD004',
  },
  ORD005: {
    id: 'store/quickorder.ORD005',
  },
  ORD006: {
    id: 'store/quickorder.ORD006',
  },
  ORD007: {
    id: 'store/quickorder.ORD007',
  },
  ORD008: {
    id: 'store/quickorder.ORD008',
  },
  ORD009: {
    id: 'store/quickorder.ORD009',
  },
  ORD011: {
    id: 'store/quickorder.ORD011',
  },
  ORD012: {
    id: 'store/quickorder.ORD012',
  },
  ORD013: {
    id: 'store/quickorder.ORD013',
  },
  ORD014: {
    id: 'store/quickorder.ORD014',
  },
  ORD015: {
    id: 'store/quickorder.ORD015',
  },
  ORD016: {
    id: 'store/quickorder.ORD016',
  },
  ORD017: {
    id: 'store/quickorder.ORD017',
  },
  ORD019: {
    id: 'store/quickorder.ORD019',
  },
  ORD020: {
    id: 'store/quickorder.ORD020',
  },
  ORD021: {
    id: 'store/quickorder.ORD021',
  },
  ORD022: {
    id: 'store/quickorder.ORD022',
  },
  ORD023: {
    id: 'store/quickorder.ORD023',
  },
  ORD024: {
    id: 'store/quickorder.ORD024',
  },
  ORD025: {
    id: 'store/quickorder.ORD025',
  },
  ORD026: {
    id: 'store/quickorder.ORD026',
  },
  ORD027: {
    id: 'store/quickorder.ORD027',
  },
  ORD028: {
    id: 'store/quickorder.ORD028',
  },
  ORD029: {
    id: 'store/quickorder.ORD029',
  },
  ORD030: {
    id: 'store/quickorder.ORD030',
  },
  ORD031: {
    id: 'store/quickorder.ORD031',
  },
  customerPart: {
    id: 'store/quickorder.customerPart',
  },
  goToProductPage: {
    id: 'store/quickorder.goToProductPage',
  },
  unitOfMeasure: {
    id: 'store/quickorder.unitOfMeasure',
  },
  quantityPerUnit: {
    id: 'store/quickorder.quantityPerUnit',
  },
  unitMultiplier: {
    id: 'store/quickorder.unitMultiplier',
  },
  inStock: {
    id: 'store/quickorder.inStock',
  },
  outOfStock: {
    id: 'store/quickorder.outOfStock',
  },
  moq: {
    id: 'store/quickorder.moq',
  },
  leadTime: {
    id: 'store/quickorder.leadTime',
  },
  orderedQuantity: {
    id: 'store/quickorder.ordered-quantity',
    defaultMessage: 'Ordered Quantity: '
  }
})

// let orderFormId = ''

const CSS_HANDLES = [
  'quickOrderTable',
  'tableCol1',
  'productName',
  'skuInfoRow',
  'skuName',
  'customerPart',
  'productLink',
  'productDetailsLink',
  'tableCol2',
  'tableCol2Col1',
  'tableCol2Col2',
  'itemUom',
  'KeyValueLabel',
  'KeyValueValue',
  'unitMultiplier',
  'deleteRowBtn',
  'tableCol3',
  'lineItemStatus',
  'customerPartLabel',
  'customerPartValue',
  'uomDescription',
  'inStockMessage',
  'outOfStockMessage',
  'stockAvailabilityMessage',
  'stockAvailabilityValue',
  'productPageLink',
  'orderedQuantity',
  'orderedQuantityLabel',
  'orderedQuantityValue',
  'quickOrderTableRowWithIssues',
  'unAuthorizedMessage',
  'leadTime',
  'moq',
]

const ReviewBlock: FunctionComponent<WrappedComponentProps & any> = ({
  onReviewItems,
  reviewedItems,
  onRefidLoading,
  intl,
}: any) => {
  // const { data: orderFormData } = useQuery<{
  //   orderForm
  // }>(OrderFormQuery, {
  //   ssr: false,
  //   skip: !!orderFormId,
  // })
  const client = useApolloClient()
  const styles = useCssHandles(CSS_HANDLES)
  const { binding } = useRuntime()
  // const customerNumber =
  //   soldToAccount?.getOrderSoldToAccount?.customerNumber ?? ''

  // const targetSystem = soldToAccount?.getOrderSoldToAccount?.targetSystem ?? ''
  // const salesOrganizationCode =
  //   soldToAccount?.getOrderSoldToAccount?.salesOrganizationCode ?? ''

  const { useItemListState } = ItemListContext
  const { customerNumber, targetSystem, salesOrganizationCode, itemStatuses } =
    useItemListState()

  const [state, setReviewState] = useState<any>({
    reviewItems:
      reviewedItems.map((item: any, index: number) => {
        return {
          ...item,
          index,
        }
      }) || [],
  })

  const { reviewItems } = state

  // if (orderFormData?.orderForm?.orderFormId) {
  //   orderFormId = orderFormData.orderForm.orderFormId
  // }
  const errorMessage = {
    'store/quickorder.valid': messages.valid,
    'store/quickorder.available': messages.available,
    'store/quickorder.unavailable': messages.unavailable,
    'store/quickorder.unauthorized': messages.unAuthorized,
    'store/quickorder.unauthorized.catalog-eu': messages.unAuthorizedCatalogEU,
    'store/quickorder.unauthorizedError': messages.unAuthorizedError,
    'store/quickorder.invalidPattern': messages.invalidPattern,
    'store/quickorder.skuNotFound': messages.skuNotFound,
    'store/quickorder.withoutStock': messages.withoutStock,
    'store/quickorder.withoutPriceFulfillment':
      messages.withoutPriceFulfillment,
    'store/quickorder.cannotBeDelivered': messages.cannotBeDelivered,
    'store/quickorder.ORD002': messages.ORD002,
    'store/quickorder.ORD003': messages.ORD003,
    'store/quickorder.ORD004': messages.ORD004,
    'store/quickorder.ORD005': messages.ORD005,
    'store/quickorder.ORD006': messages.ORD006,
    'store/quickorder.ORD007': messages.ORD007,
    'store/quickorder.ORD008': messages.ORD008,
    'store/quickorder.ORD009': messages.ORD009,
    'store/quickorder.ORD011': messages.ORD011,
    'store/quickorder.ORD012': messages.ORD012,
    'store/quickorder.ORD013': messages.ORD013,
    'store/quickorder.ORD014': messages.ORD014,
    'store/quickorder.ORD015': messages.ORD015,
    'store/quickorder.ORD016': messages.ORD016,
    'store/quickorder.ORD017': messages.ORD017,
    'store/quickorder.ORD019': messages.ORD019,
    'store/quickorder.ORD020': messages.ORD020,
    'store/quickorder.ORD021': messages.ORD021,
    'store/quickorder.ORD022': messages.ORD022,
    'store/quickorder.ORD023': messages.ORD023,
    'store/quickorder.ORD024': messages.ORD024,
    'store/quickorder.ORD025': messages.ORD025,
    'store/quickorder.ORD026': messages.ORD026,
    'store/quickorder.ORD027': messages.ORD027,
    'store/quickorder.ORD028': messages.ORD028,
    'store/quickorder.ORD029': messages.ORD029,
    'store/quickorder.ORD030': messages.ORD030,
    'store/quickorder.ORD031': messages.ORD031,
  }

  const isEURegion = () => {
    const url = binding?.canonicalBaseAddress ?? undefined

    return url
      ? !!url.split(`/`).find((element) => element === `catalog-eu`)
      : false
  }

  const validateRefids = (refidData: any, reviewed: any) => {
    let error = false

    reviewed = reviewed.map((i: any) => {
      const unit = refidData.getSkuAvailability?.items?.find(
        (d: any) => i.sku === d.refid
      )?.unitMultiplier

      const minQty = refidData.getSkuAvailability?.items?.find(
        (d: any) => i.sku === d.refid
      )?.moq

      i.quantity = validateQuantity(minQty, unit, i.quantity)

      return {
        ...i,
        unit,
        minQty,
      }
    })

    if (refidData) {
      const itemsFromQuery = refidData.getSkuAvailability?.items ?? []
      const refIdNotFound = itemsFromQuery.filter((item: any) => {
        return item.sku === null
      })

      const refIdFound = itemsFromQuery.filter((item: any) => {
        return item.sku !== null
      })

      const refNotAuthorized = itemsFromQuery.filter((item: any) => {
        return item.availability !== 'authorized'
      })

      const vtexSku = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.sku
      }

      const getPrice = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.price
      }

      const mappedRefId = {}

      if (refidData?.skuFromRefIds?.items) {
        refidData.skuFromRefIds.items.forEach((item: any) => {
          mappedRefId[item.refid] = item
        })
      }

      const getAvailableQuantity = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.availableQuantity
      }

      const getAvailability = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.availability
      }

      const getItemFromQuery = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret
      }

      const errorMsg = (item: any) => {
        let ret: any = null
        const notfound = refIdNotFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku === null
        })

        const found = refIdFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku !== null
        })

        ret = notfound
          ? 'store/quickorder.skuNotFound'
          : found?.availability && found.availability === 'unauthorized'
          ? 'store/quickorder.unauthorizedError'
          : item.error

        return ret
      }

      if (refIdNotFound.length || refNotAuthorized.length) {
        error = true
      }

      const items = reviewed.map((item: any) => {
        const sellers = item.sku ? mappedRefId[item.sku]?.sellers : '1'
        const itm = getItemFromQuery(item)

        return {
          ...item,
          sellers: item.sku ? mappedRefId[item.sku]?.sellers : '1',
          seller: sellers?.length ? sellers[0].id : '1',
          availableQuantity: getAvailableQuantity(item),
          price: getPrice(item),
          vtexSku: vtexSku(item),
          totalQuantity: item.quantity,
          error: errorMsg(item),
          availability: getAvailability(item),
          productName: itm?.productName,
          skuName: itm?.skuName,
          uom: itm?.uom,
          leadTime: itm?.leadTime,
          uomDescription: itm?.uomDescription,
          linkText: itm?.linkText,
          unitMultiplier: itm?.unitMultiplier,
          moq: itm?.moq,
          refid: itm?.refid,
        }
      })

      const merge = (original: any) => {
        const item = items.find((curr: any) => {
          return original.sku === curr.sku
        })

        return item || original
      }

      const updated = reviewItems.map((item: any) => {
        return merge(item)
      })

      onReviewItems(updated)

      setReviewState({
        ...state,
        reviewItems: updated,
        hasError: error,
      })
    }
  }

  const getRefIds = async (_refids: any, reviewed: any) => {
    onRefidLoading(true)
    let refids = {}

    if (_refids.length) {
      _refids.forEach((refid: any) => {
        refids[refid] = true
      })
      refids = Object.getOwnPropertyNames(refids)
    }

    try {
      const query = {
        query: GET_PRODUCT_DATA,
        variables: {
          refIds: refids as string[],
          customerNumber,
          targetSystem,
          salesOrganizationCode,
        },
      }

      const { data } = await client.query(query)

      // TODO: Remove this line
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          keyValuePairsToString(data?.getSkuAvailability?.performanceData),
          null,
          2
        )
      )
      if (data) {
        validateRefids(data, reviewed)
      }
    } catch (error) {
      console.error(error)
    }

    onRefidLoading(false)
  }

  const convertRefIds = (items: any) => {
    const refids = items
      .filter((item: any) => {
        return item.error === null
      })
      .map((item: any) => {
        return item.sku
      })

    getRefIds(refids, items)
  }

  // Purpose is to avoid un necessary re renderings
  // get review items basic info
  const revItemStr = GetText(reviewItems)

  // recreate validate function only if reviewItem basic info changed
  const checkValidatedItems = useCallback(() => {
    const items: [any] = reviewItems.filter((item: any) => {
      return item.sku !== null && item.error === null && !item.vtexSku
    })

    if (items.length) {
      convertRefIds(items)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revItemStr])

  // execute if validate function recreated
  useEffect(() => {
    checkValidatedItems()
  }, [checkValidatedItems])

  const removeLine = (i: number) => {
    const items: [any] = reviewItems
      .filter((item: any) => {
        return item.index !== i
      })
      .map((item: any, index: number) => {
        return {
          ...item,
          line: index,
          index,
        }
      })

    onReviewItems(items)
    setReviewState({
      ...state,
      reviewItems: items,
    })
  }

  const getLineError = (lineItem: any) => {
    const item = itemStatuses.find((itm: any) => itm.index === lineItem.index)

    return item?.error ? intl.formatMessage(errorMessage[item.error]) : null
  }

  const getLineItemStatus = (lineItem: any) => {
    const item = itemStatuses.find((itm: any) => itm.index === lineItem.index)

    return item?.availability
  }

  const tableStyles = `.ReactVirtualized__Grid__innerScrollContainer>div {padding: 0;}`

  const tableSchema = {
    properties: {
      col1: {
        type: 'object',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.lineNumber',
        }),
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          const itemError = getLineError(rowData)
          const itemAvailability = getLineItemStatus(rowData)

          return (
            <div
              className={`${styles.quickOrderTable} ${
                itemError ? styles.quickOrderTableRowWithIssues : ''
              } flex w-100 relative`}
            >
              <style>{tableStyles}</style>

              <div
                className={`${styles.tableCol1} flex flex-column ${
                  targetSystem === TARGET_SYSTEM.JDE ? 'w-40' : 'w-50'
                } pa3`}
              >
                <div className={`${styles.productName}`}>
                  <Tooltip label={rowData.productName}>
                    <span className="truncate">{rowData.productName}</span>
                  </Tooltip>
                </div>
                <div
                  className={`${styles.skuInfoRow} flex flex-row justify-between`}
                >
                  <div className={`${styles.skuName} truncate`}>
                    {/* Add decording to decord encorderd texts */}
                    {decodeURIComponent(rowData.sku)}
                  </div>
                  <div className={`${styles.customerPart} ml3`}>
                    <span className={`${styles.customerPartLabel} ttu`}>
                      {intl.formatMessage(messages.customerPart)}
                    </span>
                    <span
                      className={`${styles.customerPartValue} ml2 truncate`}
                    >
                      {/* Add decording to decord encorderd texts */}
                      {decodeURIComponent(rowData?.partNumber)}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.productLink} flex justify-between w-100`}
                >
                  <div className={`${styles.orderedQuantity} truncate`}>
                    <span className={`${styles.orderedQuantityLabel} mr3`}>
                      {intl.formatMessage(messages.orderedQuantity)}
                    </span>
                    <span className={`${styles.orderedQuantityValue}`}>
                      {!Number.isNaN(rowData.quantity) ? rowData.quantity : ''}
                    </span>
                  </div>
                  <div className={`${styles.productPageLink} ml3`}>
                    {!Number.isNaN(rowData.quantity) && rowData?.linkText && (
                      <a
                        className={`${styles.productDetailsLink} flex-column`}
                        href={`${rowData?.linkText}/p`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {intl.formatMessage(messages.goToProductPage)}
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span className="red">{itemError}</span>
                </div>
              </div>

              <div
                className={`${
                  itemError ? styles.quickOrderTableRowWithIssues : ''
                } ${styles.tableCol2} flex pa3 ${
                  targetSystem === TARGET_SYSTEM.JDE ? 'w-40' : 'w-30'
                }`}
              >
                {targetSystem === TARGET_SYSTEM.JDE ? (
                  <div className={`${styles.tableCol2Col1} w-40`}>
                    <ItemPricing
                      itemNumber={rowData?.sku}
                      customerNumber={customerNumber}
                    />
                  </div>
                ) : (
                  <div />
                )}
                <div
                  className={`${styles.tableCol2Col2} ${
                    targetSystem === TARGET_SYSTEM.JDE ? 'w-60' : 'w-100'
                  }`}
                >
                  {rowData.uom && (
                    <div
                      className={`${styles.itemUom} flex flex-row justify-between`}
                    >
                      <div className={`${styles.KeyValueLabel}`}>
                        {intl.formatMessage(messages.unitOfMeasure)}
                      </div>
                      <div className={`${styles.KeyValueValue}`}>
                        {rowData.uom}
                      </div>
                    </div>
                  )}
                  {rowData.uomDescription && (
                    <div
                      className={`${styles.uomDescription} flex flex-row justify-between`}
                    >
                      <div className={`${styles.KeyValueLabel}`}>
                        {intl.formatMessage(messages.quantityPerUnit)}
                      </div>
                      <div className={`${styles.KeyValueValue}`}>
                        {rowData.uomDescription}
                      </div>
                    </div>
                  )}
                  {rowData.unitMultiplier && (
                    <div
                      className={`${styles.uomDescription} flex flex-row justify-between`}
                    >
                      <div className={`${styles.KeyValueLabel}`}>
                        {intl.formatMessage(messages.unitMultiplier)}
                      </div>
                      <div className={`${styles.KeyValueValue}`}>
                        {rowData.unitMultiplier}
                      </div>
                    </div>
                  )}
                  {rowData.moq && (
                    <div
                      className={`${styles.moq} flex flex-row justify-between`}
                    >
                      <div className={`${styles.KeyValueLabel}`}>
                        {intl.formatMessage(messages.moq)}
                      </div>
                      <div className={`${styles.KeyValueValue}`}>
                        {rowData.moq}
                      </div>
                    </div>
                  )}

                  {rowData.leadTime && (
                    <div
                      className={`${styles.leadTime} flex flex-row justify-between`}
                    >
                      <div className={`${styles.KeyValueLabel}`}>
                        {intl.formatMessage(messages.leadTime)}
                      </div>
                      <div className={`${styles.KeyValueValue}`}>
                        {rowData.leadTime}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`${styles.tableCol3} flex flex-column w-20 pa3`}>
                <div
                  className={`${styles.stockAvailabilityMessage} flex w-100`}
                >
                  {itemAvailability === 'available' ? (
                    <span className={`${styles.inStockMessage} b ttu`}>
                      {intl.formatMessage(messages.inStock)}
                    </span>
                  ) : itemAvailability === 'unavailable' && !itemError ? (
                    <span className={`${styles.outOfStockMessage} b ttu`}>
                      {intl.formatMessage(messages.outOfStock)}
                    </span>
                  ) : (
                    itemAvailability === 'unauthorized' && (
                      <span className={`${styles.unAuthorizedMessage} b ttu`}>
                        {intl.formatMessage(
                          isEURegion()
                            ? messages.unAuthorizedCatalogEU
                            : messages.unAuthorized
                        )}
                      </span>
                    )
                  )}
                </div>
                <div className={`${styles.stockAvailabilityValue} w-40`}>
                  {targetSystem === TARGET_SYSTEM.JDE ? (
                    <StockAvailability
                      itemIndex={rowData?.index}
                      itemNumber={rowData?.sku}
                      customerNumber={customerNumber}
                    />
                  ) : (
                    <div />
                  )}
                </div>
              </div>
              <div className={`${styles.deleteRowBtn} absolute right-0 top-0`}>
                <ButtonWithIcon
                  icon={remove}
                  variation="tertiary"
                  onClick={() => {
                    removeLine(rowData.index)
                  }}
                />
              </div>
            </div>
          )
        },
      },
    },
  }

  return (
    <div>
      <Table
        dynamicRowHeight
        fullWidth
        disableHeader
        schema={tableSchema}
        items={reviewItems}
      />
    </div>
  )
}

ReviewBlock.propTypes = {
  onReviewItems: PropTypes.func,
  reviewItems: PropTypes.array,
  onRefidLoading: PropTypes.func,
}

export default injectIntl(ReviewBlock)
