import { type NextApiHandler } from 'next'
import { appRouter } from '../../../server/trpc/router/_app';
import { nextHandler } from 'trpc-playground/handlers/next'

const setupHandler = nextHandler({
  router: appRouter,
  // tRPC api path, pages/api/trpc/[trpc].ts in this case
  trpcApiEndpoint: '/api/trpc',
  playgroundEndpoint: '/api/trpc/playground',
  request: {
    superjson: true,
  },
})

const handler: NextApiHandler = async (req, res) => {
  const playgroundHandler = await setupHandler
  await playgroundHandler(req, res)
}

export default handler
