import React from 'react'
import { useQuery } from 'react-apollo'
import { ExtensionPoint } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'

import OrderSoldToAccount from './queries/orderSoldToAccount.graphql'
import './sbdsefprod.sold-to-validation.css'

const SoldToValidationWrapper = () => {
  const CSS_HANDLES = ['soldToAcctErrorMessage', 'errorMessegeContainer']

  const handles = useCssHandles(CSS_HANDLES)

  const {
    data: soldToAcctData,
    loading: soldToLoading,
    error: soldToError,
  } = useQuery(OrderSoldToAccount, { ssr: false })

  if (soldToLoading) {
    console.info('soldToLoading', soldToLoading)
  }

  if (soldToError) {
    console.info('soldToError', soldToError)
  }

  if (!soldToAcctData?.getOrderSoldToAccount) {
    return (
      <div className={handles.errorMessegeContainer}>
        <div className={handles.soldToAcctErrorMessage}>
          Please select Sold to Account
        </div>
      </div>
    )
  }

  return <ExtensionPoint id="quick-order-wrapper" />
}

export default SoldToValidationWrapper
