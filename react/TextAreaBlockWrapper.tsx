import React from 'react'
import { useQuery } from 'react-apollo'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import TextAreaBlock from './TextAreaBlock'
import { isPunchoutQuoteSession } from './utils/punchout'

interface TextAreaBlockInterface {
  value: string
  onRefidLoading: any
  text?: string
  description?: string
  componentOnly?: boolean
}

const TextAreaBlockWrapper = ({
  value,
  onRefidLoading,
  text,
  description,
  componentOnly,
}: TextAreaBlockInterface) => {
  const { ItemListProvider } = ItemListContext

  const { data: accountData, loading: accountDataLoading } = useQuery(
    GET_ACCOUNT_INFO,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  const { orderForm } = useOrderForm()

  if (isPunchoutQuoteSession(orderForm)) {
    return null
  }

  return (
    <ItemListProvider
      accountData={accountData}
      accountDataLoading={accountDataLoading}
    >
      <TextAreaBlock
        {...{ value, onRefidLoading, text, description, componentOnly }}
      />
    </ItemListProvider>
  )
}

export default TextAreaBlockWrapper
