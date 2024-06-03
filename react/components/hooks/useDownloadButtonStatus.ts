import ItemListContext from '../../ItemListContext'
import { TARGET_SYSTEM } from '../../utils/const'

const useDownloadButtonStatus = (reviewItems: any[]) => {
  const { useItemListState } = ItemListContext
  const { showAddToCart, targetSystem, itemStatuses } = useItemListState()

  const isLoadingPredicate = (itemStatus: ItemStatus) => {
    const reviewItem =
      reviewItems.length >= itemStatus.index
        ? reviewItems[itemStatus.index]
        : null

    const loading =
      targetSystem === TARGET_SYSTEM.JDE && reviewItem?.mto
        ? itemStatus.isPriceLoading
        : itemStatus.isPriceLoading || itemStatus.isQuantityLoading

    return loading
  }

  const disabled = !showAddToCart || itemStatuses.some(isLoadingPredicate)

  return {
    disabled,
  }
}

export default useDownloadButtonStatus
