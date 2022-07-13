import React, { useContext, useState } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { Button, Spinner, Table, ToastContext } from 'vtex.styleguide'
import type { MessageDescriptor } from 'react-intl'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql/graphql/__types_entrypoint'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { usePWA } from 'vtex.store-resources/PWAContext'

import ItemListContext from './ItemListContext'
import { GetText } from './utils'
import ReviewBlock from './components/ReviewBlock'

const CSS_HANDLES = [
  'reviewBlock',
  'buttonsBlock',
  'addToCartDisabled',
  'addToCartBtn',
  'buttonValidate',
] as const

interface ItemType {
  id: string
  quantity: number
}

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

const PunchoutReview = () => {
  const { orderForm, setOrderForm } = useOrderForm()
  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings
  const handles = useCssHandles(CSS_HANDLES)
  const intl = useIntl()
  const [state, setState] = useState<any>({
    reviewItems: [],
    reviewState: false,
    showAddToCart: false,
  })

  const { reviewItems, reviewState } = state
  const [refidLoading, setRefIdLoading] = useState<any>()
  const { useItemListState, useItemListDispatch } = ItemListContext
  const dispatch = useItemListDispatch()
  const { showAddToCart } = useItemListState()
  const { showToast } = useContext(ToastContext)
  const [addToCart, { error: mutationError, loading: mutationLoading }] =
    useMutation<{ addToCart: OrderFormType }, { items: [] }>(ADD_TO_CART)

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

  const quoteItems = JSON.parse(
    (orderForm.customData?.customApps ?? []).find(
      (app) => app.id === 'punchout-to-go'
    )?.fields.quoteItems ?? '[]'
  )

  const callAddToCart = async (items: any) => {
    const currentItemsInCart = orderForm.items
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

    // Update OrderForm from the context
    mutationResult.data && setOrderForm(mutationResult.data.addToCart)

    const adjustSkuItemForPixelEvent = (item: any) => {
      return {
        skuId: item.id,
        quantity: item.quantity,
      }
    }

    // Send event to pixel-manager
    const pixelEventItems = items.map(adjustSkuItemForPixelEvent)

    push({
      event: 'addToCart',
      items: pixelEventItems,
    })

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

  const onRefidLoading = (data: boolean) => {
    setRefIdLoading(data)
  }

  const backList = () => {
    setState({
      ...state,
      reviewState: false,
    })
  }

  const parseText = () => {
    const items: any = quoteItems || []
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

  if (quoteItems.length === 0) {
    return null
  }

  if (!reviewState) {
    return (
      <div className="w-100 mb5">
        <div className="bg-base t-body c-on-base ph3 br3 b--muted-4">
          <div className="mb5">
            <Table
              fullWidth
              schema={{
                properties: {
                  sku: {
                    title: 'Reference code',
                    minWidth: 350,
                  },
                  quantity: {
                    title: 'Quantity',
                    // default is 200px
                    minWidth: 100,
                  },
                },
              }}
              items={quoteItems}
              density="high"
              onRowClick={({ rowData }) => {
                alert(
                  `you just clicked ${rowData.name}, number is ${rowData.number} and email ${rowData.email}`
                )
              }}
            />
          </div>
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
    )
  }

  return (
    <div className={`w-100 ph4 ${handles.reviewBlock}`}>
      <ReviewBlock
        reviewedItems={quoteItems.map((quoteItem: any, index) => {
          return {
            ...quoteItem,
            index,
            line: index,
            error: null,
            content: `${quoteItem.sku},${quoteItem.quantity}`,
          }
        })}
        onReviewItems={onReviewItems}
        onRefidLoading={onRefidLoading}
      />
      <div
        className={`mb4 mt4 flex justify-between ${handles.buttonsBlock} ${
          !showAddToCart ? handles.addToCartDisabled : handles.addToCartBtn
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
  )
}

export default PunchoutReview
