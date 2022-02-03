import React from 'react'
import { useCssHandles } from 'vtex.css-handles'

const QuickOrderWrapper = ({ children }) => {
  const CSS_HANDLES = ['quickOrderStyles']

  const handles = useCssHandles(CSS_HANDLES)

  return <div className={handles.quickOrderStyles}>{children}</div>
}

export default QuickOrderWrapper
