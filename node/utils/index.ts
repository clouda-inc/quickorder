import { AuthenticationError, ForbiddenError, UserInputError } from '@vtex/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function statusToError(e: any) {
  if (!e.response) {
    throw e
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { status } = e.response!

  if (status === 401) {
    throw new AuthenticationError(e)
  }

  if (status === 403) {
    throw new ForbiddenError(e)
  }

  if (status === 400) {
    throw new UserInputError(e)
  }

  throw e
}
