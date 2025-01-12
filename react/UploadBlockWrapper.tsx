import React from 'react'
import { useQuery } from 'react-apollo'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import UploadBlock from './UploadBlock'

interface UploadBlockInterface {
  text?: string
  description?: string
  componentOnly?: boolean
  downloadText?: string
}

const UploadBlockWrapper = ({
  text,
  description,
  componentOnly,
  downloadText,
}: UploadBlockInterface) => {
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
      <UploadBlock {...{ text, description, componentOnly, downloadText }} />
    </ItemListProvider>
  )
}

export default UploadBlockWrapper
