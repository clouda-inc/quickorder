export const keyValuePairsToString = (performanceData: [KeyValue]) => {
  if (performanceData === undefined || performanceData === null) {
    return {}
  }

  return performanceData.reduce((acc: any, current: KeyValue) => {
    return {
      ...acc,
      [current.key]: current.value,
    }
  }, {})
}
