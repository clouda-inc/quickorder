type OrderFormSimulationData = {
  soldTo: string
  soldToCustomerNumber: string
  soldToInfo: string
  targetSystem: string
}

type OrderFormPunchoutData = {
  sesseionKey: string
  quoteItems: string
}

type SetSoldToResponse = {
  setSoldToAccount: {
    simulationInfo: OrderFormSimulationData
    punchoutInfo: OrderFormPunchoutData
  }
}
