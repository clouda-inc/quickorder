export const formatUOMDescription = (value: string) => {
  if (!value) return value

  const splitted = value.split(' ') ?? []

  try {
    if (splitted.length === 0) {
      return value
    }

    const numValue = parseFloat(parseFloat(splitted[0]).toFixed(2))

    splitted[0] = numValue.toString()

    return splitted.join(' ')
  } catch (error) {
    return value
  }
}
