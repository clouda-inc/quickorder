import { InstanceOptions, IOContext, ExternalClient } from '@vtex/api'

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

  public getSkuContextByRefId = (refId: string ) => {
    this.context.logger.debug({
      auth: this.context.authToken,
      url: this.context.host,
    })
    const endpoint = `${this.options?.baseURL}/api/catalog_system/pvt/sku/stockkeepingunitbyalternateId/${refId}`

    return this.http.get(`/api/catalog_system/pvt/sku/stockkeepingunitbyalternateId/${refId}`, {
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
}
