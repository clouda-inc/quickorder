import moment from "moment"

export async function health(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: { logger },
    clients: { masterdata: mdClient }
  } = ctx

  // The scheduler "bulk-order-health-check" will be using
  // this end-point to ensure that this service is up and running.
  const timeLiteral = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSSSSS')
  logger.info(`Bulk order service is up and running at ${timeLiteral}.`)
  await mdClient.createDocument({
    dataEntity: 'TestServiceLog',
    fields: { timeLiteral },
  })

  ctx.status = 200
  ctx.set('Cache-Control', 'No-Cache')

  await next()
}
