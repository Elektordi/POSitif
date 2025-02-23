import { ResourceWithOptions, ActionRequest, PageContext, ListActionResponse, RecordActionResponse } from 'adminjs'
import { getModelByName } from '@adminjs/prisma'
import bcrypt from "bcryptjs"

import { prisma } from "../common.ts"


export const userAdmin: ResourceWithOptions = {
    resource: {
        model: getModelByName('User'),
        client: prisma
    },
    options: {
        navigation: { icon: 'User' },
        actions: {
            new: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.superadmin,
                before: async (request: ActionRequest) => {
                    if (request.payload?.password) {
                        request.payload.password = bcrypt.hashSync(request.payload.password, bcrypt.genSaltSync());
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
                isAccessible: ({ currentAdmin, record }) => currentAdmin?.superadmin || (currentAdmin && record && currentAdmin.id === record.get("id")),
                before: async (request: ActionRequest, context: PageContext) => {
                    // no need to hash on GET requests, we'll remove passwords there anyway
                    if (request.method === 'post') {
                        // hash only if password is present, delete otherwise
                        // so we don't overwrite it
                        if (request.payload?.password) {
                            request.payload.password = bcrypt.hashSync(request.payload.password, bcrypt.genSaltSync());
                        } else {
                            delete request.payload?.password;
                        }
                        if (!context.currentAdmin?.superadmin) delete request.payload?.superadmin;
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
            delete: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.superadmin,
            }
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
}

export const authenticate = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })
    if (bcrypt.compareSync(password, user?.password || "")) {
        return Promise.resolve(user)
    }
    return null
}