import express from 'express'
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource, getModelByName } from '@adminjs/prisma'
import { PrismaClient } from '@prisma/client'
import { hash } from "crypto";

import session from 'express-session';
import createMemoryStore from 'memorystore';
const MemoryStore = createMemoryStore(session);


const PORT = process.env.PORT || 3000

const authenticate = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  })
  if (hash("sha512", password, "base64") === user?.password) {
    return Promise.resolve(user)
  }
  return null
}

const prisma = new PrismaClient()

AdminJS.registerAdapter({ Database, Resource })

const run = async () => {
  const app = express()

  const admin = new AdminJS({
    resources: [{
      resource: {
        model: getModelByName('User'),
        client: prisma
      },
      options: {
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.password) {
                request.payload.password = hash("sha512", request.payload.password, "base64");
              }
              return request;
            },
          },
          show: {
            after: async (response: RecordActionResponse) => {
              response.record.params.password = '';
              return response;
            },
          },
          edit: {
            before: async (request) => {
              // no need to hash on GET requests, we'll remove passwords there anyway
              if (request.method === 'post') {
                // hash only if password is present, delete otherwise
                // so we don't overwrite it
                if (request.payload?.password) {
                  request.payload.password = hash("sha512", request.payload.password, "base64");
                } else {
                  delete request.payload?.password;
                }
              }
              return request;
            },
            after: async (response: RecordActionResponse) => {
              response.record.params.password = '';
              return response;
            },
          },
          list: {
            after: async (response: ListActionResponse) => {
              response.records.forEach((record) => {
                record.params.password = '';
              });
              return response;
            },
          },
        },
        properties: {
          password: {
            type: 'password',
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: true, // we only show it in the edit view
            },
          },
        },
      },
    }],
  })

  if(process.env.NODE_ENV !== 'production') {
    //admin.watch();
  }

  const router = AdminJSExpress.buildAuthenticatedRouter(admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: 'sessionsecret',
    },
    null,
    {
      store: new MemoryStore(),
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
