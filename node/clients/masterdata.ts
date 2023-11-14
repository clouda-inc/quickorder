import { InstanceOptions, IOContext, ExternalClient } from '@vtex/api'

export class CustomerSKUMasterData extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br`,
      context,
      options
    )
  }

  public searchCustomerSKUDocuments = (whareClause: string): Promise<any> => {

    return this.http.get(`/api/dataentities/KU/search?_fields=customerNumber%2CskuRefId%2CcustomerSku&_where=(${whareClause})`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
        'Proxy-Authorization': this.context.authToken,
        'Cache-Control': 'no-cache',
      },
    })
  }
}
