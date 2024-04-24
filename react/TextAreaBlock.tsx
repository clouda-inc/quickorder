/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { FunctionComponent } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { Button, Textarea, ToastContext, Spinner } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation, useApolloClient } from 'react-apollo'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import * as XLSX from 'xlsx';

import ReviewBlock from './components/ReviewBlock'
import { SpecialBrandHandleModal } from './components/modals/SpecialBrandHandle'
import { ParseText, GetText } from './utils'
import { addToCartGTMEventData } from './utils/GTMEventDataHandler'
import ItemListContext from './ItemListContext'
import { TableDataContext, TableData } from './utils/context'

const messages = defineMessages({
  success: {
    id: 'store/toaster.cart.success',
    defaultMessage: '',
    label: '',
  },
  duplicate: {
    id: 'store/toaster.cart.duplicated',
    defaultMessage: '',
    label: '',
  },
  error: { id: 'store/toaster.cart.error', defaultMessage: '', label: '' },
  seeCart: {
    id: 'store/toaster.cart.seeCart',
    defaultMessage: '',
    label: '',
  },
  loadingSoldTo: {
    id: 'store/toaster.cart.loading-soldTo',
    defaultMessage: 'Loading sold to..',
  },
})

interface ItemType {
  id: string
  quantity: number
}

const SPECAIL_BRAND_NAME = 'SPIRALOCK'

const TextAreaBlock: FunctionComponent<
  TextAreaBlockInterface & WrappedComponentProps
> = ({ intl, value, text, description, componentOnly }: any) => {
  const [state, setState] = useState<any>({
    reviewState: false,
    textAreaValue: value || '',
    reviewItems: [],
  })

  const [refidLoading, setRefIdLoading] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModelOpen] = useState<boolean>(false)

  const { tableData, handleExtractData } = useContext(TableDataContext) as TableData;

  console.log('context data: ', tableData);

  const { textAreaValue, reviewItems, reviewState } = state
  const apolloClient = useApolloClient()

  const [addToCart, { error: mutationError, loading: mutationLoading }] =
    useMutation<{ addToCart: OrderFormType }, { items: [] }>(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()
  const { showToast } = useContext(ToastContext)

  const { useItemListState, useItemListDispatch } = ItemListContext
  const { isLoadingCustomerInfo, showAddToCart, customerNumber, targetSystem } =
    useItemListState()

  const dispatch = useItemListDispatch()

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return translateMessage(messages.error)
    if (!isNewItem) return translateMessage(messages.duplicate)

    return translateMessage(messages.success)
  }

  const toastMessage = ({
    success,
    isNewItem,
  }: {
    success: boolean
    isNewItem: boolean
  }) => {
    const message = resolveToastMessage(success, isNewItem)

    showToast({ message })
  }

  const callAddToCart = async (items: any) => {
    const currentItemsInCart = orderForm.orderForm.items
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: ItemType) => {
          const [existsInCurrentOrder] = currentItemsInCart.filter(
            (el: any) => el.id === item.id.toString()
          )

          if (existsInCurrentOrder) {
            item.quantity += parseInt(existsInCurrentOrder.quantity, 10)
          }

          return {
            ...item,
          }
        }),
      },
    })

    if (mutationError) {
      console.error(mutationError)
      toastMessage({ success: false, isNewItem: false })

      return
    }

    push({
      event: 'bulkAddToCart',
      items: addToCartGTMEventData(
        orderForm?.orderForm?.items,
        items,
        mutationResult?.data?.addToCart?.items
      ),
    })

    // Update OrderForm from the context
    mutationResult.data && setOrderForm(mutationResult.data.addToCart)

    if (
      mutationResult.data?.addToCart?.messages?.generalMessages &&
      mutationResult.data.addToCart.messages.generalMessages.length
    ) {
      mutationResult.data.addToCart.messages.generalMessages.map((msg: any) => {
        return showToast({
          message: msg.text,
          action: undefined,
          duration: 30000,
        })
      })
    } else {
      toastMessage({ success: true, isNewItem: true })
    }

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }

  const onReviewItems = (items: any) => {
    if (items) {
      const show =
        items.filter((item: any) => {
          return !item.vtexSku
        }).length === 0

      setState({
        ...state,
        reviewItems: items,
        reviewState: true,
        showAddToCart: show,
        textAreaValue: GetText(items),
      })

      console.log('adding items to context');
      handleExtractData('-1', items, ' ')

      dispatch({
        type: 'UPDATE_ALL_STATUSES',
        args: {
          itemStatuses: items.map((item: any) => ({
            index: item.index,
            availability: item.availability,
            error: item.error,
            sku: item.sku,
            availableQuantity: !Number.isNaN(item.availableQuantity)
              ? parseInt(item.availableQuantity, 10)
              : 0,
          })),
        },
      })
    }

    return true
  }

  const parseText = async () => {
    setLoading(true)
    const items: any =
      (await ParseText(
        textAreaValue,
        apolloClient,
        customerNumber,
        targetSystem
      )) || []
    setLoading(false)

    const error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setState({
      ...state,
      reviewItems: items,
      reviewState: true,
      hasError: error,
      toValidate: true,
      textAreaValue: GetText(items),
    })

    dispatch({
      type: 'ADD_STATUSES',
      args: {
        itemStatuses: items.map((item: any, index: number) => ({
          index,
          error: item.error,
          sku: item.sku,
        })),
      },
    })
  }

  const setTextareaValue = ($textAreaValue: string) => {
    setState({
      ...state,
      textAreaValue: $textAreaValue,
    })
  }

  const CSS_HANDLES = [
    'buttonValidate',
    'textContainer',
    'componentContainer',
    'reviewBlock',
    'buttonsBlock',
    'textContainerTitle',
    'textContainerDescription',
    'textContainerMain',
    'addToCartDisabled',
    'addToCartBtn',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  const addToCartCopyNPaste = () => {
    const currentItemsInCart = orderForm.orderForm.items

    const isSpecialBrandItemExistInCurrentCart = (currentItemsInCart ?? []).find((item:any)=>item?.additionalInfo?.brandName?.toUpperCase() === SPECAIL_BRAND_NAME)
    const specialBrandItemInReviewItems = (reviewItems ?? []).filter((item:any)=> item.brand.toUpperCase() === SPECAIL_BRAND_NAME)

    const cond1 = currentItemsInCart.length > 0 && !!isSpecialBrandItemExistInCurrentCart && specialBrandItemInReviewItems.length === reviewItems.length
    const cond2 = currentItemsInCart.length === 0  && specialBrandItemInReviewItems.length === reviewItems.length
    const cond3 = currentItemsInCart.length === 0  && specialBrandItemInReviewItems.length === 0
    const cond4 = currentItemsInCart.length > 0  && !isSpecialBrandItemExistInCurrentCart && specialBrandItemInReviewItems.length === 0

    if (cond1 || cond2 || cond3 || cond4) {
      const items: any = reviewItems
      .filter((item: any) => item.error === null && item.vtexSku !== null)
      .map(({ vtexSku, quantity, seller, unit }: any) => {
        return {
          id: parseInt(vtexSku, 10),
          quantity: parseFloat(quantity) / unit,
          seller,
        }
      })

      const merge = (internalItems: any) => {
        return internalItems.reduce((acc, val) => {
          const { id, quantity }: ItemType = val
          const ind = acc.findIndex((el: any) => el.id === id)

          if (ind !== -1) {
            acc[ind].quantity += quantity
          } else {
            acc.push(val)
          }

          return acc
        }, [])
      }

      const mergedItems = merge(items)

      callAddToCart(mergedItems)
    } else {
      setIsModelOpen(true)
    }
  }

  const onRefidLoading = (data: boolean) => {
    setRefIdLoading(data)
  }

  const backList = () => {
    setState({
      ...state,
      reviewState: false,
    })
  }

  if (isLoadingCustomerInfo) {
    return <p>{intl.formatMessage(messages.loadingSoldTo)}</p>
  }

  const downloadExcelFile = () => {
    const data = tableData.flatMap((item: any) => {
      if (!item?.priceList) {
        return {
          'STANLEY PART NUMBER': item.skuName,
          'Description': item.description,
          'LEAD TIME': item.leadTime,
          'STOCKING UOM': item.uom,
          'PRICING UOM': item.uom,
          'CARTON QTY': item.uomDescription,
          'Weight': item.seller,
          'TARIFF CODE': item.availability,
          'ORIGIN': item.error,
          'Qty': item.quantity,
          'Price': item.price,
          'Avaliability': item.stockAvailability,
        }
      }
      return item.priceList.map((priceItem: any) => {
        return {
          'STANLEY PART NUMBER': item.skuName,
          'Description': item.description,
          'LEAD TIME': item.leadTime,
          'STOCKING UOM': item.uom,
          'PRICING UOM': item.uom,
          'CARTON QTY': item.uomDescription,
          'Weight': item.seller,
          'TARIFF CODE': item.availability,
          'ORIGIN': item.error,
          'Qty': priceItem.quantity,
          'Price': priceItem.price,
          'Avaliability': item.stockAvailability,
        }
      })
    })

    const worksheet = XLSX.utils.json_to_sheet(data);

  // Color the headers
  const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
  for(let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if(!worksheet[address]) continue;
    worksheet[address].s = {
      fill: {
        fgColor: {rgb: "FFFF00"} // <-- yellow fill
      }
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OrderItems');
  XLSX.writeFile(workbook, 'OrderItems.xlsx');
  };


  return (
    <div className={`${handles.textContainerMain} flex flex-column`}>
       <SpecialBrandHandleModal isModalOpen={isModalOpen} setIsModelOpen={setIsModelOpen}/>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-100 fl-l`}>
          <h2
            className={`t-heading-3 mb3 ml5 ml3-ns mt4 ${handles.textContainerTitle}`}
          >
            {text}
          </h2>
          <div
            className={`t-body lh-copy c-muted-1 mb7 ml3 false ${handles.textContainerDescription}`}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: `<div> ${description} </div>`,
              }}
            />
          </div>
        </div>
      )}

      <div
        className={`${handles.componentContainer} ${
          !componentOnly ? 'w-100 fr-l pb6' : ''
        }`}
      >
        {!reviewState && (
          <div className="w-100 mb5">
            <div className="bg-base t-body c-on-base ph3 br3 b--muted-4">
              <Textarea
                value={textAreaValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setTextareaValue(e.target.value)
                }
              />
              <div className={`mt2 flex justify-end ${handles.buttonValidate}`}>
                <Button
                  variation="secondary"
                  size="regular"
                  isLoading={loading}
                  onClick={() => {
                    parseText()
                  }}
                >
                  <FormattedMessage id="store/quickorder.validate" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {reviewState && (
          <div className={`w-100 ph4 ${handles.reviewBlock}`}>
            <ReviewBlock
              reviewedItems={reviewItems}
              onReviewItems={onReviewItems}
              onRefidLoading={onRefidLoading}
            />
            <div
              className={`mb4 mt4 flex justify-between ${
                handles.buttonsBlock
              } ${
                !showAddToCart
                  ? handles.addToCartDisabled
                  : handles.addToCartBtn
              }`}
            >
              <Button
                variation="tertiary"
                size="small"
                onClick={() => {
                  backList()
                }}
              >
                <FormattedMessage id="store/quickorder.back" />
              </Button>
              {refidLoading && <Spinner />}
              <div>
              <Button
                variation="primary"
                size="small"
                style={{ marginRight: '15px' }}
                onClick={downloadExcelFile}
              >
                <FormattedMessage id="store/quickorder.download" />
              </Button>

              <Button
                variation="primary"
                size="small"
                isLoading={mutationLoading}
                onClick={() => {
                  addToCartCopyNPaste()
                }}
                disabled={!showAddToCart}
                style={{ marginLeft: '12px' }}
              >
                <FormattedMessage id="store/quickorder.addToCart" />
              </Button>
              </div>
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface MessageDescriptor {
  id: string
  description?: string | any
  defaultMessage?: string
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

interface TextAreaBlockInterface {
  value: string
  onRefidLoading: any
  text?: string
  description?: string
  componentOnly?: boolean
}

export default injectIntl(TextAreaBlock)
