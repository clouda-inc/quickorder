/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vtex/prefer-early-return */
import React, { useState, FunctionComponent } from 'react'
import {
  ButtonWithIcon,
  IconDelete,
  // IconInfo,
  // Input,
  Table,
  Tooltip,
} from 'vtex.styleguide'
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'

import { GetText, validateQuantity } from '../utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import getRefIdTranslation from '../queries/refids.gql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import OrderFormQuery from '../queries/orderForm.gql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GET_PRODUCT_DATA from '../queries/getPrductAvailability.graphql'
// import { stubFalse } from 'lodash'

import './ReviewBlock.css'

const remove = <IconDelete />
let initialLoad = ''

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
]

const ReviewBlock: FunctionComponent<WrappedComponentProps & any> = ({
  onReviewItems,
  reviewedItems,
  onRefidLoading,
  intl,
  soldToAccount,
}: any) => {
  // const { data: orderFormData } = useQuery<{
  //   orderForm
  // }>(OrderFormQuery, {
  //   ssr: false,
  //   skip: !!orderFormId,
  // })
  const client = useApolloClient()
  const styles = useCssHandles(CSS_HANDLES)

  const customerNumber =
    soldToAccount?.getOrderSoldToAccount?.customerNumber ?? ''

  const targetSystem = soldToAccount?.getOrderSoldToAccount?.targetSystem ?? ''
  const salesOrganizationCode =
    soldToAccount?.getOrderSoldToAccount?.salesOrganizationCode ?? ''

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

  const validateRefids = (refidData: any, reviewed: any) => {
    let error = false

    reviewed = reviewed.map((i: any) => {
      const unit = refidData.getSkuAvailability?.items?.find(
        (d: any) => i.sku === d.refid
      )?.unitMultiplier

      const minQty = refidData.getSkuAvailability?.items?.find(
        (d: any) => i.sku === d.refid
      )?.minQty

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

      const refNotAvailable = itemsFromQuery.filter((item: any) => {
        return item.availability !== 'available'
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

      // const getSellers = (item: any) => {
      //   let ret: any = []
      //
      //   if (!!refidData && !!refidData.getSkuAvailability.items) {
      //     ret = refidData.getSkuAvailability.items.find((curr: any) => {
      //       return !!item.sku && item.sku === curr.refid
      //     })
      //     if (!!ret && !!ret.sellers) {
      //       ret = ret.sellers
      //     }
      //   }
      //
      //   return ret
      // }

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
          : found?.availability && found.availability !== 'available'
          ? `store/quickorder.${found.availability}`
          : null

        return ret
      }

      if (refIdNotFound.length || refNotAvailable.length) {
        error = true
      }

      const items = reviewed.map((item: any) => {
        // const sellers = getSellers(item)
        const sellers = item.sku ? mappedRefId[item.sku]?.sellers : '1'
        const itm = getItemFromQuery(item)

        return {
          ...item,
          sellers: item.sku ? mappedRefId[item.sku]?.sellers : '1',
          seller: sellers?.length ? sellers[0].id : '1',
          availableQuantity: getAvailableQuantity(item),
          price: getPrice(item),
          vtexSku: vtexSku(item),
          totalQuantity:
            (item.sku ? mappedRefId[item.sku]?.unitMultiplier : '1') *
            item.quantity,
          error: errorMsg(item),
          availability: getAvailability(item),
          productName: itm?.productName,
          skuName: itm?.skuName,
          uom: itm?.uom,
          uomDescription: itm?.uomDescription,
          linkText: itm?.linkText,
          unitMultiplier: itm?.unitMultiplier,
          minQty: itm?.minQty,
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

  const checkValidatedItems = () => {
    const items: [any] = reviewItems.filter((item: any) => {
      return item.sku !== null && item.error === null && !item.vtexSku
    })

    if (items.length) {
      convertRefIds(items)
    }
  }

  if (initialLoad !== GetText(reviewItems)) {
    checkValidatedItems()
    initialLoad = GetText(reviewItems)
  }

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

  // const updateLineContent = (index: number, content: string) => {
  //   const items = reviewItems.map((item: any) => {
  //     return item.index === index
  //       ? {
  //           ...item,
  //           content,
  //         }
  //       : item
  //   })

  //   setReviewState({
  //     ...state,
  //     reviewItems: items,
  //   })
  // }

  // const updateLineSeller = (index: number, seller: string) => {
  //   const items = reviewItems.map((item: any) => {
  //     return item.index === index
  //       ? {
  //           ...item,
  //           seller,
  //         }
  //       : item
  //   })
  //
  //   setReviewState({
  //     ...state,
  //     reviewItems: items,
  //   })
  // }

  // const onBlurField = (line: number) => {
  //   const joinLines = GetText(reviewItems)
  //   const reviewd: any = ParseText(joinLines)

  //   if (reviewd[line].error === null) {
  //     setReviewState({
  //       ...state,
  //       reviewItems: reviewd,
  //     })
  //   }
  // }

  const tableSchema = {
    properties: {
      col1: {
        type: 'object',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.lineNumber',
        }),
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          const statusMessage = intl.formatMessage(
            errorMessage[
              rowData?.error !== null && rowData?.error !== undefined
                ? rowData?.error
                : 'store/quickorder.available'
            ]
          )

          return (
            <div className={`${styles.quickOrderTable} flex w-100 relative`}>
              <div className={`${styles.tableCol1} flex flex-column w-40 pa3`}>
                <div className={`${styles.productName}`}>
                  <Tooltip label={rowData.productName}>
                    <span className="truncate">{rowData.productName}</span>
                  </Tooltip>
                </div>
                <div
                  className={`${styles.skuInfoRow} flex flex-row justify-between`}
                >
                  <div className={`${styles.skuName} truncate`}>
                    {rowData.sku}
                  </div>
                  <div className={`${styles.customerPart} ml3`}>
                    <span className={`${styles.customerPartLabel} ttu`}>
                      {intl.formatMessage(messages.customerPart)}
                    </span>
                    <span
                      className={`${styles.customerPartValue} ml2 truncate`}
                    >
                      {rowData.refid}
                    </span>
                  </div>
                </div>
                <div className={`${styles.productLink} flex justify-end w-100`}>
                  <a
                    className={`${styles.productDetailsLink} flex-column`}
                    href={`${rowData?.linkText}/p`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {intl.formatMessage(messages.goToProductPage)}
                  </a>
                </div>
              </div>

              <div className={`${styles.tableCol2} flex w-40 pa3`}>
                <div className={`${styles.tableCol2Col1} w-40`} />
                <div className={`${styles.tableCol2Col2} w-60`}>
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
                  <div
                    className={`${styles.unitMultiplier} flex flex-row justify-between`}
                  >
                    <div className={`${styles.KeyValueLabel}`}>
                      {intl.formatMessage(messages.moq)}
                    </div>
                    <div className={`${styles.KeyValueValue}`}>
                      {rowData.minQty}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.tableCol3} flex flex-column w-20 pa3`}>
                <div
                  className={`${styles.stockAvailabilityMessage} flex justify-center w-100`}
                >
                  <Tooltip label={statusMessage}>
                    {rowData?.availability === 'available' ||
                    statusMessage === null ||
                    statusMessage === '' ? (
                      <span className={`${styles.inStockMessage} b ttu`}>
                        {intl.formatMessage(messages.inStock)}
                      </span>
                    ) : (
                      <span className={`${styles.outOfStockMessage} b ttu`}>
                        {intl.formatMessage(messages.outOfStock)}
                      </span>
                    )}
                  </Tooltip>
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
