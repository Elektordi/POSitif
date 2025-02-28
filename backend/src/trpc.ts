import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import { prisma } from "./common";

export const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => {
    return {};
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
export const appRouter = t.router({

  userList: t.procedure.query((opts) => {
    return prisma.user.findMany({
        select: {
            id: true,
            email: true
        }
    });
  }),

  userGetById: t.procedure.input(z.number()).query(async (opts) => {
    const { input } = opts;
    return prisma.user.findUnique({
        select: {
            id: true,
            email: true
        },
        where: {
            id: input
        }
    });
  }),


});

export type AppRouter = typeof appRouter;