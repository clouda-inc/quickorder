import { createContext } from 'react';

export interface TableData {
  tableData: any;
  handleExtractData: (itemNumber: any, newData: any, dataType: string) => void;
}

export const TableDataContext = createContext<TableData | undefined>(undefined)
