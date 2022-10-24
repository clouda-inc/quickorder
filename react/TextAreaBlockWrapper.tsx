import React from 'react'
import { useQuery } from 'react-apollo'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import TextAreaBlock from './TextAreaBlock'

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
