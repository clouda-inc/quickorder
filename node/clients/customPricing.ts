/* eslint-disable max-params */
import {
  InstanceOptions,
  IOContext,
  RequestConfig,
  ExternalClient,
} from '@vtex/api'

import { statusToError } from '../utils'

interface ItemPricingInput {
  Customer: string
  Item_Number: string
  Effective_Date: string
}

export class CustomPricing extends ExternalClient {
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

  public getItemPricing(
    data: ItemPricingInput,
    settings: AppSettings
  ): Promise<any> {
    return this.http.post(
      `${settings.agoraBaseUrl}/smartOrder/VTEX/v1/material/price`,
      data,
      {
        headers: {
          'Agora-Subscription-Key': settings.agoraSubscriptionKey,
        },
        metric: 'get-item-pricing',
      }
    )
  }

  protected post = <T>(url: string, data?: any, config?: RequestConfig) => {
    return this.http.post<T>(url, data, config).catch(statusToError)
  }
}
