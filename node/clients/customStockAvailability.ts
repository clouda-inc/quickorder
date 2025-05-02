/* eslint-disable max-params */
import type {
  InstanceOptions,
  IOContext,
  RequestConfig,
} from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { statusToError } from '../utils'

interface StockAvailabilityInput {
  Customer: string
  ItemNumber: string
  Thru_Date: string
}

export class CustomStockAvailability extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-vtex-use-https': 'true',
      },
    })
  }

  public async getStockAvailability(
    data: StockAvailabilityInput,
    settings: AppSettings
  ): Promise<any> {


    try {
      const dataResponse = await this.http.post(
        `${settings.agoraBaseUrl}/smartOrder/VTEX/v1/material/stockavailability`,
        data,
        {
          headers: {
            'Agora-Subscription-Key': settings.agoraSubscriptionKey,
          },
          metric: 'get-item-availability',
          timeout: 60000,
        }
      )

      return dataResponse
    } catch (e) {
      const errorStatus = e.response.status
      if (errorStatus === 504) {
        return {
          itemNumber: '',
          customer: '',
          thruDate: '',
          primaryUoM: '',
          pricingUoM: '',
          errorType: 'Gateway Timeout'
        }
      }
      return null
    }
  }

  protected post = <T>(url: string, data?: any, config?: RequestConfig) => {
    return this.http.post<T>(url, data, config).catch(statusToError)
  }
}
