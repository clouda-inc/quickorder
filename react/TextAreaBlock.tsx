/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { FunctionComponent, useEffect } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { Button, Textarea, ToastContext, Spinner } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'
import { useLazyQuery, useMutation } from 'react-apollo'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'

import ReviewBlock from './components/ReviewBlock'
import { ParseText, GetText } from './utils'
import ItemListContext from './ItemListContext'
import PRODUCTS_BY_IDS from './queries/productsByIds.gql'

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
})

interface ItemType {
  id: string
  quantity: number
}

const TextAreaBlock: FunctionComponent<
  TextAreaBlockInterface & WrappedComponentProps
> = ({ intl, value, text, description, componentOnly }: any) => {
  const [state, setState] = useState<any>({
    reviewState: false,
    textAreaValue: value || '',
    reviewItems: [],
  })

  const [gtmProductDetails, setGtmProductDetails] = useState<
    GtmProductDetail[]
  >([])

  const [getProductsByIds] = useLazyQuery(PRODUCTS_BY_IDS, {
    onCompleted: (data: any) => {
      setGtmProductDetails(data?.productsByIdentifier ?? [])
    },
  })

  const [refidLoading, setRefIdLoading] = useState<any>()

  const { textAreaValue, reviewItems, reviewState } = state

  const [addToCart, { error: mutationError, loading: mutationLoading }] =
    useMutation<{ addToCart: OrderFormType }, { items: [] }>(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()
  const { showToast } = useContext(ToastContext)

  const { useItemListState, useItemListDispatch } = ItemListContext
  const { isLoadingCustomerInfo, showAddToCart } = useItemListState()

  const dispatch = useItemListDispatch()

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  useEffect(() => {
    if (gtmProductDetails.length !== 0) {
      const pixelEventItems: any = []

      gtmProductDetails.map((prod: GtmProductDetail) => {
        pixelEventItems.push({
          item_id: prod.productId,
          item_name: prod.productName,
          item_category: prod.categoryTree[0]?.name ?? undefined,
          item_category2: prod.categoryTree[1]?.name ?? undefined,
          item_category3: prod.categoryTree[2]?.name ?? undefined,
          item_category4: prod.categoryTree[3]?.name ?? undefined,
          item_category5: prod.categoryTree[4]?.name ?? undefined,
          quantity:
            reviewItems.find(
              (i: { quantity: number; vtexSku: string }) =>
                i.vtexSku === prod.productId.toString()
            )?.quantity ?? 1,
        })
      })
      push({
        event: 'bulkAddToCart',
        items: pixelEventItems,
      })
    }
  }, [gtmProductDetails])

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

  const createBulkAddToCartEventData = (
    itemsByUser: any,
    previousOrderFormItems: any,
    mutationItems: any
  ) => {
    if (!mutationItems || !itemsByUser) {
      return null
    }

    return itemsByUser
      ?.map((el: { id: any }) => {
        const mutatedItem =
          mutationItems && Array.isArray(mutationItems)
            ? mutationItems.find(
                (item: { id: any }) => item.id === el.id.toString()
              )
            : null

        if (mutatedItem) {
          const previousItem =
            previousOrderFormItems && Array.isArray(previousOrderFormItems)
              ? previousOrderFormItems?.find(
                  (item: { id: any }) => item.id === el.id.toString()
                )
              : null

          const quantity = previousItem
            ? mutatedItem.quantity - previousItem.quantity
            : mutatedItem.quantity

          const categories = mutatedItem.productCategories
            ? Object.entries(mutatedItem.productCategories)
            : null

          return {
            item_id: mutatedItem.productRefId,
            item_name: mutatedItem.name,
            item_category:
              categories && categories.length > 0
                ? categories[0][1]
                : undefined,
            item_category2:
              categories && categories.length > 1
                ? categories[1][1]
                : undefined,
            item_category3:
              categories && categories.length > 2
                ? categories[2][1]
                : undefined,
            item_category4:
              categories && categories.length > 3
                ? categories[3][1]
                : undefined,
            item_category5:
              categories && categories.length > 4
                ? categories[4][1]
                : undefined,
            quantity,
          }
        }

        return {}
      })
      .filter((x: any) => Object.keys(x).length !== 0)
  }

  const triggerEvent = (
    itemsByUser: any,
    previousOrderFormItems: any,
    mutationItems: any
  ) => {
    // eslint-disable-next-line no-self-assign
    window.dataLayer = window.dataLayer
    window.dataLayer.push({
      event: 'bulkAddToCart',
      ecommerce: {
        items: createBulkAddToCartEventData(
          itemsByUser,
          previousOrderFormItems,
          mutationItems
        ),
      },
    })
  }

  const callAddToCart = async (items: any) => {
    console.log('___itemsbyuser: ', items)

    const currentItemsInCart = orderForm.orderForm.items

    console.log('___currentitems: ', currentItemsInCart)

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

    console.log('___mutation: ', mutationResult)

    if (mutationError) {
      console.error(mutationError)
      toastMessage({ success: false, isNewItem: false })

      return
    }

    // Update OrderForm from the context
    mutationResult.data && setOrderForm(mutationResult.data.addToCart)

    const idArray = items.map((i: { id: number }) => i.id)

    getProductsByIds({ variables: { values: idArray } })

    // console.log('___productsbyid: ', gtmProductDetails)
    console.log(
      '___gtmitems: ',
      createBulkAddToCartEventData(
        items,
        currentItemsInCart,
        mutationResult?.data?.addToCart?.items ?? null
      )
    )

    triggerEvent(
      items,
      currentItemsInCart,
      mutationResult?.data?.addToCart?.items ?? null
    )

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

  const parseText = () => {
    const items: any = ParseText(textAreaValue) || []
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
    return <p>Loading sold to..</p>
  }

  return (
    <div className={`${handles.textContainerMain} flex flex-column`}>
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
            {description}
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
              <Button
                variation="primary"
                size="small"
                isLoading={mutationLoading}
                onClick={() => {
                  addToCartCopyNPaste()
                }}
                disabled={!showAddToCart}
              >
                <FormattedMessage id="store/quickorder.addToCart" />
              </Button>
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
