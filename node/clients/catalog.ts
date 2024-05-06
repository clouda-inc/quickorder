import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export class Catalog extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br`,
      context,
      options
    )
  }

  public inventoryBySkuId = (id: string | number) => {
    this.context.logger.debug({
      auth: this.context.authToken,
      url: this.context.host,
    })
    const endpoint = `${this.options?.baseURL}/api/logistics/pvt/inventory/skus/${id}`

    return this.http.get(`/api/logistics/pvt/inventory/skus/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
        'Proxy-Authorization': this.context.authToken,
        'X-Vtex-Proxy-To': endpoint,
        'X-Vtex-Use-Https': true,
        'Cache-Control': 'no-cache',
      },
    })
  }

  public getProductByRefId = async (refId: string) => {
    this.context.logger.debug({
      auth: this.context.authToken,
      url: this.context.host,
    })

    const productEndpoint = `${this.options?.baseURL}/api/catalog_system/pvt/products/productgetbyrefid/${refId}`
    const productResponse = await this.http.get(productEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
        'Proxy-Authorization': this.context.authToken,
        'X-Vtex-Proxy-To': productEndpoint,
        'X-Vtex-Use-Https': true,
        'Cache-Control': 'no-cache',
      },
    })

    return productResponse
  }

  public getSkuContextByRefId = async (refId: string) => {
    this.context.logger.debug({
      auth: this.context.authToken,
      url: this.context.host,
    })

    const productResponse = await this.getProductByRefId(refId)

    const brandId = productResponse?.BrandId
    const brandEndpoint = `${this.options?.baseURL}/api/catalog_system/pvt/brand/${brandId}`

    const brandResponse = await this.http.get(brandEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
        'Proxy-Authorization': this.context.authToken,
        'X-Vtex-Proxy-To': brandEndpoint,
        'X-Vtex-Use-Https': true,
        'Cache-Control': 'no-cache',
      },
    })

    return brandResponse
  }

  public getSpecificationByName = async (
    skuRefId: string,
    skuSpecName: string
  ) => {
    this.context.logger.debug({
      auth: this.context.authToken,
      url: this.context.host,
    })

    const productResponse = await this.getProductByRefId(skuRefId)

    if (!productResponse || !productResponse?.Id) {
      return null
    }

    const productSpecificationsEndpoint = `${this.options?.baseURL}/api/catalog_system/pvt/products/${productResponse.Id}/specification`

    const productSpecificationsResponse = await this.http.get(
      productSpecificationsEndpoint,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          VtexIdclientAutCookie: `${this.context.authToken}`,
          'Proxy-Authorization': this.context.authToken,
          'X-Vtex-Proxy-To': productSpecificationsEndpoint,
          'X-Vtex-Use-Https': true,
          'Cache-Control': 'no-cache',
        },
      }
    )

    if (
      !productSpecificationsResponse ||
      !productSpecificationsResponse?.length
    ) {
      return null
    }

    const specValue = productSpecificationsResponse.find(
      (el: { Name: string }) =>
        el?.Name?.toUpperCase().trim() === skuSpecName?.toUpperCase().trim()
    )?.Value

    return specValue
  }
}
