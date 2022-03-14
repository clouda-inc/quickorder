import React, { useCallback } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { DispatchFunction } from 'vtex.product-context/ProductDispatchContext'
import { ProductContext } from 'vtex.product-context'

import StepperProductQuantity from './StepperProductQuantity'

export type NumericSize = 'small' | 'regular' | 'large'

export interface BaseProps {
  dispatch: DispatchFunction
  selectedItem?: ProductContext['selectedItem']
  selectedQuantity: number
  size?: NumericSize
}

const CSS_HANDLES = [
  'quantitySelectorContainer',
] as const

export type OnChangeCallback = {
  value: number
}

const BaseProductQuantity: StorefrontFunctionComponent<BaseProps> = ({
  dispatch,
  size = 'small',
  selectedQuantity,
}) => {
  const handles = useCssHandles(CSS_HANDLES)
  const onChange = useCallback(
    (e: OnChangeCallback) => {
      dispatch({ type: 'SET_QUANTITY', args: { quantity: e.value } })
    },
    [dispatch]
  )

  return (
    <div
      className={`${handles.quantitySelectorContainer} flex flex-column mb4`}>
      <StepperProductQuantity
        size={size}
        selectedQuantity={selectedQuantity}
        onChange={onChange}
      />
    </div>
  )
}

export default BaseProductQuantity
