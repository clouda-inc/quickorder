import React, { FunctionComponent } from 'react'
import { NumericStepper } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
// import { SelectedItem } from 'vtex.product-context'

import { OnChangeCallback, BaseProps } from './BaseProductQuantity'

// const DEFAULT_UNIT = 'un'

interface StepperProps {
  // unitMultiplier: SelectedItem['unitMultiplier']
  // measurementUnit: SelectedItem['measurementUnit']
  selectedQuantity: BaseProps['selectedQuantity']
  onChange: (e: OnChangeCallback) => void
  size: BaseProps['size']
  // showUnit: boolean
}

const CSS_HANDLES = ['quantitySelectorStepper'] as const

const StepperProductQuantity: FunctionComponent<StepperProps> = ({
  size = 'small',
  selectedQuantity,
  onChange,
}) => {
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={handles.quantitySelectorStepper}>
      <NumericStepper
        size={size}
        minValue={1}
        unitMultiplier={1}
        // suffix={
        //   showUnit && measurementUnit !== DEFAULT_UNIT
        //     ? measurementUnit
        //     : undefined
        // }
        onChange={onChange}
        value={selectedQuantity}
        maxValue={100000000}
      />
    </div>
  )
}

export default StepperProductQuantity
