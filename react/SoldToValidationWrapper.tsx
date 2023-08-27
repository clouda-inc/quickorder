import React from 'react'
import { useQuery } from 'react-apollo'
import { ExtensionPoint } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import { Spinner } from 'vtex.styleguide'

import OrderSoldToAccount from './queries/orderSoldToAccount.graphql'
import './sbdsefuat.sold-to-validation.css'
import {defineMessages, useIntl} from 'react-intl'

const messages = defineMessages({
  selectSoldToAccount: {
    id: 'store/sold-to-validation.select-sold-to-account',
    defaultMessage: 'Please select Sold to Account',
  },
})

const SoldToValidationWrapper = () => {
  const CSS_HANDLES = [
    'soldToAcctErrorMessage',
    'errorMessegeContainer',
    'quickOrderLoading',
    'quickOrderSpinnerContainer',
  ]

  const handles = useCssHandles(CSS_HANDLES)
  const intl = useIntl()

  const {
    data: soldToAcctData,
    loading: soldToLoading,
    error: soldToError,
  } = useQuery(OrderSoldToAccount, { ssr: false })

  if (soldToLoading) {
    return (
      <div className={handles.quickOrderSpinnerContainer}>
        <div className={handles.quickOrderLoading}>
          <Spinner />
        </div>
      </div>
    )
  }

  if (soldToError) {
    console.info('ERROR LOADING...', soldToError)
  }

  if (!soldToAcctData?.getOrderSoldToAccount) {
    return (
      <div className={handles.errorMessegeContainer}>
        <div className={handles.soldToAcctErrorMessage}>
          {intl.formatMessage(messages.selectSoldToAccount)}
        </div>
      </div>
    )
  }

  return <ExtensionPoint id="quick-order-wrapper" />
}

export default SoldToValidationWrapper
