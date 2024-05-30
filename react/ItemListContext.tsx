import React, {
  ReactChildren,
  ReactChild,
  useReducer,
  useContext,
  createContext,
  useEffect,
} from 'react'

interface ItemStatus {
  index: number
  sku: string
  error: string
  availability: string
  availableQuantity: number
  isQuantityLoading: boolean
  price: number
}

export interface State {
  customerNumber: string
  targetSystem: string
  salesOrganizationCode: string
  isLoadingCustomerInfo: boolean
  itemStatuses: ItemStatus[]
  showAddToCart: boolean
  showDownloadButton: boolean
}

interface SetCustomerInfo {
  type: 'SET_CUSTOMER_INFO'
  args: {
    customerNumber: string
    targetSystem: string
    salesOrganizationCode: string
  }
}

interface SetItemStatuses {
  type: 'ADD_STATUSES'
  args: { itemStatuses: ItemStatus[] }
}

interface UpdateAllStatuses {
  type: 'UPDATE_ALL_STATUSES'
  args: { itemStatuses: ItemStatus[] }
}

interface UpdateItemStatus {
  type: 'UPDATE_STATUS'
  args: { itemStatus: ItemStatus }
}

interface SetInitialLoading {
  type: 'SET_INITIAL_LOADING'
  args: { isLoading: boolean }
}

interface SetItemAvailability {
  type: 'SET_ITEM_AVAILABILITY'
  args: { itemStatus: ItemStatus }
}

interface SetItemPrice {
  type: 'SET_ITEM_PRICE'
  args: { itemStatus: ItemStatus }
}

type ReducerActions =
  | SetItemStatuses
  | UpdateAllStatuses
  | UpdateItemStatus
  | SetCustomerInfo
  | SetInitialLoading
  | SetItemAvailability
  | SetItemPrice

export type Dispatch = (action: ReducerActions) => void

const categoryReducer = (state: State, action: ReducerActions): State => {
  const getProductAvailability = (
    availability?: string,
    availableQuantity = 0,
    isLoading = false
  ) => {
    return isLoading
      ? ''
      : availability === 'unauthorized'
      ? 'unauthorized'
      : availableQuantity > 0
      ? 'available'
      : 'unavailable'
  }

  const getAvailableQuantity = (
    vtexQuantity: number,
    externalQuantity: number
  ) => {
    return state.targetSystem === 'JDE' ? vtexQuantity : externalQuantity
  }

  switch (action.type) {
    case 'ADD_STATUSES': {
      const itemStatuses = action?.args?.itemStatuses ?? []

      return {
        ...state,
        itemStatuses,
        showAddToCart: false,
        showDownloadButton: false,
      }
    }

    case 'UPDATE_ALL_STATUSES': {
      const itemStatuses = action?.args?.itemStatuses ?? []

      const allItems = state.itemStatuses.map((item: ItemStatus) => {
        const selected = itemStatuses.find((i: any) => i.index === item.index)

        // if JDE available quantity comes from external api
        const availableQuantity = getAvailableQuantity(
          item.availableQuantity,
          selected?.availableQuantity ?? 0
        )

        const availability = getProductAvailability(
          selected?.availability,
          availableQuantity,
          item?.isQuantityLoading
        )

        return {
          ...item,
          sku: selected?.sku,
          error: selected?.error,
          availability,
          availableQuantity,
        } as ItemStatus
      })

      return {
        ...state,
        itemStatuses: allItems,
        showAddToCart:
          itemStatuses.filter((item: ItemStatus) => !!item.error).length === 0,
      }
    }

    case 'UPDATE_STATUS': {
      const statuses = state.itemStatuses.map((item: ItemStatus) => {
        if (item.index === action?.args?.itemStatus.index) {
          return {
            ...item,
            error: action?.args?.itemStatus.error,
            availability: action?.args?.itemStatus.availability,
          }
        }

        return item
      })

      return {
        ...state,
        itemStatuses: statuses,
        showAddToCart:
          statuses.filter((item: ItemStatus) => !!item.error).length === 0,
      }
    }

    case 'SET_CUSTOMER_INFO': {
      return {
        ...state,
        customerNumber: action?.args?.customerNumber,
        targetSystem: action?.args?.targetSystem,
        salesOrganizationCode: action?.args?.salesOrganizationCode,
      }
    }

    case 'SET_INITIAL_LOADING': {
      return {
        ...state,
        isLoadingCustomerInfo: action?.args?.isLoading,
      }
    }

    case 'SET_ITEM_AVAILABILITY': {
      const items = state.itemStatuses.map((item: ItemStatus) => {
        if (item.index === action?.args?.itemStatus.index) {
          const availability = getProductAvailability(
            item?.availability,
            action?.args?.itemStatus.availableQuantity,
            action?.args?.itemStatus.isQuantityLoading
          )

          return {
            ...item,
            availableQuantity: action?.args?.itemStatus.availableQuantity,
            isQuantityLoading: action?.args?.itemStatus.isQuantityLoading,
            availability,
          }
        }

        return item
      })

      const showDownloadButton = items.every(
        (item: ItemStatus) => !!item.availability && item.price !== undefined
      )

      return {
        ...state,
        itemStatuses: items,
        showDownloadButton,
      }
    }

    case 'SET_ITEM_PRICE': {
      const items = state.itemStatuses.map((item: ItemStatus) => {
        if (item.index === action.args.itemStatus.index) {
          return {
            ...item,
            price: action.args.itemStatus.price,
          }
        }

        return item
      })

      const showDownloadButton = items.every(
        (item: ItemStatus) => !!item.availability && item.price !== undefined
      )

      return {
        ...state,
        itemStatuses: items,
        showDownloadButton,
      }
    }

    default: {
      throw new Error(`Unhandled action type on item list context`)
    }
  }
}

const DEFAULT_STATE: State = {
  itemStatuses: [],
  customerNumber: '',
  targetSystem: '',
  salesOrganizationCode: '',
  isLoadingCustomerInfo: false,
  showAddToCart: false,
  showDownloadButton: false,
}

const ItemListContext = createContext<State>(DEFAULT_STATE)
const ItemListDispatchContext = createContext<Dispatch>((action) => {
  console.error('error in dispatch ', action)
})

const initialState: State = {
  itemStatuses: [],
  customerNumber: '',
  targetSystem: '',
  salesOrganizationCode: '',
  isLoadingCustomerInfo: false,
  showAddToCart: false,
  showDownloadButton: false,
}

interface Props {
  children: ReactChildren | ReactChild
  accountData: any
  accountDataLoading: any
}

const ItemListProvider = ({
  children,
  accountData,
  accountDataLoading,
}: Props) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState)

  useEffect(() => {
    dispatch({
      type: 'SET_INITIAL_LOADING',
      args: { isLoading: accountDataLoading },
    })
  }, [accountDataLoading])

  useEffect(() => {
    dispatch({
      type: 'SET_CUSTOMER_INFO',
      args: {
        customerNumber:
          accountData?.getOrderSoldToAccount?.customerNumber ?? '',
        targetSystem: accountData?.getOrderSoldToAccount?.targetSystem ?? '',
        salesOrganizationCode:
          accountData?.getOrderSoldToAccount?.salesOrganizationCode ?? '',
      },
    })
  }, [accountData])

  return (
    <ItemListContext.Provider value={state}>
      <ItemListDispatchContext.Provider value={dispatch}>
        {children}
      </ItemListDispatchContext.Provider>
    </ItemListContext.Provider>
  )
}

const useItemListState = () => useContext(ItemListContext)

const useItemListDispatch = () => useContext(ItemListDispatchContext)

export default { ItemListProvider, useItemListState, useItemListDispatch }
