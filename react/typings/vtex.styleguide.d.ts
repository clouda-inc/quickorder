/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'vtex.styleguide' {
  import { ComponentType } from 'react'

  export const Input: ComponentType<InputProps>
  export const Button: ComponentType<InputProps>
  export const ToastContext: Context<{ showToast: any }>
  export const IconClear: ComponentType<InputProps>
  export const Tag: ComponentType<InputProps>
  export const Table: ComponentType<InputProps>
  export const ButtonWithIcon: ComponentType<InputProps>
  export const IconDelete: ComponentType<InputProps>
  export const IconInfo: ComponentType<InputProps>
  export const Tooltip: ComponentType<InputProps>
  export const Spinner: ComponentType<InputProps>
  export const Textarea: ComponentType<InputProps>
  export const Dropzone: ComponentType<InputProps>
  export const AutocompleteInput: ComponentType<InputProps>
  export const Collapsible: ComponentType<InputProps>
  export const NumericStepper: ComponentType<NumericStepperProps>
  export const Modal: ComponentType<InputProps>

  interface InputProps {
    [key: string]: any
  }

  interface NumericStepperProps {
    size: NumericSize
    value: number
    minValue: number
    maxValue?: number
    unitMultiplier: number
    suffix?: string
    onChange: (e: any) => void
  }

  export const Button
  export const Dropzone
  export const ToastContext
  export const Spinner
  export const Textarea
  export const Table
  export const ButtonWithIcon
  export const IconDelete
  export const IconInfo
  export const Tooltip
  export const Dropdown
  export const AutocompleteInput
  export const IconClear
  export const Tag
  export const Collapsible
}
