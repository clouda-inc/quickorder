import { useEffect, useState } from 'react'
import ItemListContext from '../../ItemListContext'
import { TARGET_SYSTEM } from '../../utils/const'

const useDownloadButtonStatus = (reviewItems: any[]) => {
  const { useItemListState } = ItemListContext
  const { showAddToCart, targetSystem, itemStatuses } = useItemListState()

  const [items, setItems] = useState(reviewItems)

  useEffect(() => {
    setItems(reviewItems)
  }, [reviewItems])

  const isLoadingPredicate = (itemStatus: ItemStatus) => {
    const reviewItem =
      items?.length >= itemStatus.index
        ? items[itemStatus.index]
        : null

    const loading =
      targetSystem === TARGET_SYSTEM.JDE && reviewItem?.mto
        ? itemStatus.isPriceLoading || !reviewItem?.priceList
        : (itemStatus.isPriceLoading || !reviewItem?.priceList) || itemStatus.isQuantityLoading

    return loading
  }

  const disabled = !showAddToCart || itemStatuses.some(isLoadingPredicate)

  return {
    disabled,
  }
}

export default useDownloadButtonStatus
