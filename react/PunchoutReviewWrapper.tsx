import React from 'react'
import { useQuery } from 'react-apollo'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import { isPunchoutQuoteSession } from './utils/punchout'
import PunchoutReview from './PunchoutReview'

const PunchoutReviewWrapper = () => {
  const { ItemListProvider } = ItemListContext

  const { data: accountData, loading: accountDataLoading } = useQuery(
    GET_ACCOUNT_INFO,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  const { orderForm } = useOrderForm()

  if (!isPunchoutQuoteSession(orderForm)) {
    return null
  }

  return (
    <ItemListProvider
      accountData={accountData}
      accountDataLoading={accountDataLoading}
    >
      <PunchoutReview />
    </ItemListProvider>
  )
}

export default PunchoutReviewWrapper
