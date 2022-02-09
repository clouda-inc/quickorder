import { IOClients } from '@vtex/api'

import { Search } from './search'
import { Catalog } from './catalog'
import { CustomPricing } from './customPricing'
import { CustomStockAvailability } from './customStockAvailability'

export class Clients extends IOClients {
  public get search(): any {
    return this.getOrSet('search', Search)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get customPricing () {
    return this.getOrSet('customPricing', CustomPricing)
  }

  public get customStockAvailability () {
    return this.getOrSet('customStockAvailability', CustomStockAvailability)
  }
}
