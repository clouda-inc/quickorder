import React from 'react'
// import { FormattedMessage } from 'react-intl'
import { Modal } from 'vtex.styleguide'

interface IProps {
  isModalOpen: boolean
  setIsModelOpen: (e: boolean)=> void
}

export const SpecialBrandHandleModal = ({isModalOpen, setIsModelOpen}:IProps) => {

  const handleClose: React.MouseEventHandler<HTMLDivElement> =(e)=> {
    e.preventDefault()
    e.stopPropagation()
    setIsModelOpen(false)
  }

  return (
    <>
      <Modal
        responsiveFullScreen
        isOpen={isModalOpen}
        onClose={handleClose}>
          <div className="">
            <p className="f3 f3-ns fw3 gray">
              Invalid Cart
            </p>
            <p>
              You cannot have both SPIRALOCK brand and other brands together, please strict to either SPIRALOCK products or non SPIRALOCK products
            </p>
          </div>
      </Modal>
    </>
  )
}

