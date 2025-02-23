import express from 'express'
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource } from '@adminjs/prisma'
import session from 'express-session';
import createMemoryStore from 'memorystore';

import { prisma } from "./common.ts";
import { UserAdmin, authenticate } from "./admin/user.ts";


const MemoryStore = createMemoryStore(session);
const PORT = process.env.PORT || 3000

AdminJS.registerAdapter({ Database, Resource })


const run = async () => {
    const app = express()

    const admin = new AdminJS({
        resources: [
            UserAdmin
        ],
    })

    const router = AdminJSExpress.buildAuthenticatedRouter(admin,
        {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'sessionsecret',
        },
        null,
        {
            store: new MemoryStore({ checkPeriod: 86400000 }),  // 24h
            resave: true,
            saveUninitialized: true,
            secret: 'sessionsecret',
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            },
            name: 'adminjs',
        })

    app.use(admin.options.rootPath, router)
    app.get('/', (req, res) => {
        res.redirect(admin.options.rootPath)
    })

    app.listen(PORT, () => {
        console.log(`POSitif Backend listening at http://localhost:${PORT}`)
    })
}

run()
    .finally(async () => {
        await prisma.$disconnect()
    })
