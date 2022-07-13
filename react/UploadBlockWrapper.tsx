import React from 'react'
import { useQuery } from 'react-apollo'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import UploadBlock from './UploadBlock'
import { isPunchoutQuoteSession } from './utils/punchout'

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
  const { orderForm } = useOrderForm()

  const { data: accountData, loading: accountDataLoading } = useQuery(
    GET_ACCOUNT_INFO,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  if (isPunchoutQuoteSession(orderForm)) {
    return null
  }

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
