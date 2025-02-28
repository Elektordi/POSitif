import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import bcrypt from "bcryptjs";

import { prisma } from "./common";

export const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => {
    return {};
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
export const appRouter = t.router({

    userLogin: t.procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async (opts) => {
        const { input: {username, password} } = opts;
        const user = await prisma.user.findUnique({where: {email: username}})
        if(bcrypt.compareSync(password, user?.password || "")) {
             return { ...user, password: null };
        }
        return null;
    }),
        
    userList: t.procedure.query(async (opts) => {
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