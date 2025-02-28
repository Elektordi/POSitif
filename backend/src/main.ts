import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express';
import ViteExpress from "vite-express";

import { prisma } from "./common"
import { appRouter, createContext } from "./trpc"

const PORT = parseInt(process.env.PORT || "3000")


const run = async () => {
    const app = express()

    app.use(
        '/trpc',
        trpcExpress.createExpressMiddleware({
            router: appRouter,
            createContext,
        }),
    );

    app.get('/', (req, res) => {
        res.redirect("/admin")
    })
    app.get('/favicon.ico', (req, res) => {
        res.redirect("/admin/favicon.ico")
    })

    ViteExpress.listen(app, PORT, () => {
        console.log(`POSitif Backend listening at http://localhost:${PORT}`)
    })
}

run()
    .finally(async () => {
        await prisma.$disconnect()
    })
