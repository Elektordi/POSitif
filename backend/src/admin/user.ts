import { ActionRequest, ListActionResponse, RecordActionResponse } from 'adminjs'
import { getModelByName } from '@adminjs/prisma'
import { hash } from "crypto";

import { prisma } from "../common.ts";

export const UserAdmin = {
    resource: {
        model: getModelByName('User'),
        client: prisma
    },
    options: {
        actions: {
            new: {
                before: async (request: ActionRequest) => {
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
                before: async (request: ActionRequest) => {
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
}

export const authenticate = async (email: string, password: string) => {
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