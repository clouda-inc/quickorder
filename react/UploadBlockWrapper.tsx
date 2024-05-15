import React, { useState } from 'react'
import { useQuery } from 'react-apollo'

import ItemListContext from './ItemListContext'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import UploadBlock from './UploadBlock'
import { TableDataContext } from './utils/context'

interface UploadBlockInterface {
  text?: string
  description?: string
  componentOnly?: boolean
  downloadText?: string
}

const UploadBlockWrapper = ({
  text,
  description,
  componentOnly,
  downloadText,
}: UploadBlockInterface) => {
  const [tableData, setTableData] = useState<any>()

  const { ItemListProvider } = ItemListContext

  const { data: accountData, loading: accountDataLoading } = useQuery(
    GET_ACCOUNT_INFO,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  const handleExtractData = (itemNumber, newData, dataType) => {
    if (itemNumber === '-1') {
      setTableData(newData)
    } else {
      setTableData((prevData) => {
        return prevData?.map((item) => {
          if (item.sku === itemNumber) {
            return {
              ...item,
              [dataType]: newData,
            }
          } else {
            return item
          }
        })
      })
    }
  }

  return (
    <ItemListProvider
      accountData={accountData}
      accountDataLoading={accountDataLoading}
    >
      <TableDataContext.Provider value={{ tableData, handleExtractData }}>
        <UploadBlock {...{ text, description, componentOnly, downloadText }} />
      </TableDataContext.Provider>
    </ItemListProvider>
  )
}

UploadBlockWrapper.schema = {
  title: 'Upload area inputs',
  type: 'object',
  properties: {
    description: {
      type: 'string',
      title: 'description',
      description: 'The label for the text input',
    },
  },
}

export default UploadBlockWrapper
