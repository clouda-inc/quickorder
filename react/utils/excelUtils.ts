import ExcelJS from 'exceljs'
import {
  EMAIL_TEMPLATE_LOGO,
  LEGACY_SYSTEM_TABLE_SAP,
  LEGACY_SYSTEM_TABLE_JDE,
  TARGET_SYSTEM,
} from './const'

export const fetchEmailTemplateLogo = async () => {
  try {
    const response = await fetch(EMAIL_TEMPLATE_LOGO)
    const blob = await response.blob()
    const reader = new FileReader()

    return new Promise<string>((resolve, reject) => {
      reader.readAsDataURL(blob)
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  } catch (error) {
    console.error('Error fetching or converting image: ', error)
    return ''
  }
}

export const bindTableData = (
  tableData,
  countryOfOriginList,
  getLineItemStatus,
  isEURegion
) => {
  return tableData?.flatMap((item) => {
    if (!item?.priceList) {
      return {
        skuName: item?.skuName,
        productName: item?.productName,
        leadTime: item?.leadTime,
        uom: item?.uom,
        uomDescription: item?.uomDescription,
        moq: item?.moq,
        quantity: item?.quantity,
        availability:
          getLineItemStatus(item) === 'available'
            ? 'In Stock'
            : getLineItemStatus(item) === 'unavailable'
            ? 'Out of Stock'
            : getLineItemStatus(item) === 'unauthorized' && !isEURegion()
            ? 'Not Available Online'
            : 'Not Available in Your Region',
        system: TARGET_SYSTEM.SAP,
      }
    }

    if (item?.priceList?.length === 0) {
      return {
        skuName: item?.skuName,
        productName: item?.productName,
        leadTime: item?.leadTime,
        uom: item?.uom,
        uomDescription: item?.uomDescription,
        moq: item?.moq,
        weight: item?.JDE_Weight
          ? `${item.JDE_Weight} ${item.JDE_Weight_UOM}/${item.JDE_Weight_Per_UOM}`
          : ' ',
        tariffCode: item?.JDE_HTS_Code,
        origin:
          countryOfOriginList?.find(
            (coo) => coo.udc === item?.JDE_Country_of_Origin
          )?.text ?? item?.JDE_Country_of_Origin,
        quantity: item?.quantity,
        price: `$ ${item?.price}`,
        priceUom: ' ',
        stockAvailability: item?.mto
          ? 'Made to Order'
          : item?.stockAvailability > 0
          ? `${item.stockAvailability} M`
          : 'Out of Stock',
        system: TARGET_SYSTEM.JDE,
      }
    }

    return item?.priceList?.map((priceItem) => ({
      skuName: item?.skuName,
      productName: item?.productName,
      leadTime: item?.leadTime,
      uom: item?.uom,
      uomDescription: item?.uomDescription,
      moq: item?.moq,
      weight: item?.JDE_Weight
        ? `${item.JDE_Weight} ${item.JDE_Weight_UOM}/${item.JDE_Weight_Per_UOM}`
        : ' ',
      tariffCode: item?.JDE_HTS_Code,
      origin:
        countryOfOriginList?.find(
          (coo) => coo.udc === item?.JDE_Country_of_Origin
        )?.text ?? item?.JDE_Country_of_Origin,
      quantity: priceItem?.quantity,
      price: `$ ${priceItem?.price}`,
      priceUom: priceItem?.uom,
      stockAvailability: item?.mto
        ? 'Made to Order'
        : item?.stockAvailability > 0
        ? `${item.stockAvailability} M`
        : 'Out of Stock',
      system: TARGET_SYSTEM.JDE,
    }))
  })
}

export const createExcelFile = async (data, base64Image) => {
  if (!data) {
    return
  }

  const system = data[0]?.system

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Items')

  sheet.properties.defaultRowHeight = 20

  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '14BFCC' },
  }

  sheet.getRow(1).font = {
    name: 'Calibri',
    family: 4,
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  }

  sheet.columns =
    system === TARGET_SYSTEM.JDE
      ? LEGACY_SYSTEM_TABLE_JDE
      : LEGACY_SYSTEM_TABLE_SAP

  sheet.insertRow(1, {}, 'i')

  if (base64Image) {
    sheet.getRow(1).height = 200

    const imageId2 = workbook.addImage({
      base64: base64Image,
      extension: 'png',
    })

    sheet.addImage(imageId2, {
      ext: { width: 400, height: 200 },
      tl: { col: 0, row: 0 },
    })
  }

  system === TARGET_SYSTEM.JDE
    ? sheet.mergeCells('A1:J1')
    : sheet.mergeCells('A1:H1')

  const promise = Promise.all(
    data?.map(async (product) => {
      try {
        let row

        if (system === TARGET_SYSTEM.JDE) {
          row = sheet.addRow({
            skuName: product?.skuName ?? '',
            productName: product?.productName ?? '',
            leadTime: product?.leadTime ?? '',
            uom: product?.uom ?? '',
            priceUom: product?.priceUom ?? '',
            uomDescription: product?.uomDescription ?? '',
            weight: product?.weight ?? '',
            tariffCode: product?.tariffCode ?? '',
            origin: product?.origin ?? '',
            quantity: product?.quantity ?? '',
            price: product?.price ?? '',
            stockAvailability: product?.stockAvailability ?? '',
          })
        } else {
          row = sheet.addRow({
            skuName: product?.skuName ?? '',
            productName: product?.productName ?? '',
            leadTime: product?.leadTime ?? '',
            uomDescription: product?.uomDescription ?? '',
            moq: product?.moq ?? '',
            quantity: product?.quantity ?? '',
            availability: product?.availability ?? '',
          })
        }

        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left' }
        })
      } catch (error) {
        console.error('Error adding rows: ', error)
        return error
      }
    })
  )

  return promise.then(() => {
    return workbook.xlsx.writeBuffer().then(function (sheetData) {
      const blob = new Blob([sheetData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'SEF Product Export.xlsx'
      anchor.click()
      window.URL.revokeObjectURL(url)
    })
  })
}
