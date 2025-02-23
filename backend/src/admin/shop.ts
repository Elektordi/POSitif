import { ResourceWithOptions, After, RecordActionResponse, ListActionResponse } from 'adminjs'
import { getModelByName } from '@adminjs/prisma'

import { checkboxesComponent, valueslistComponent } from './components/index.ts'
import { prisma } from "../common.ts"

export const after_many2many: After<RecordActionResponse> = async (response, request) => {
    if (request.method === 'post') {
        const new_set = (await prisma.user.findMany({
            select: {
                id: true
            },
        })).filter(x => response.record.params[`managers.${x.id}`] === 'true')
        console.log(new_set)
        await prisma.shop.update({
            where: {
                id: response.record.params['id'],
            },
            data: {
                managers: {
                    set: new_set,
                },
            },
            include: {
                managers: true,
            },
        })
    }
    const obj = (await prisma.shop.findUnique({
        where: {
            id: response.record.params['id'],
        },
        include: {
            managers: {
                select: {
                    id: true,
                }
            }
        }
    }))
    obj?.managers.forEach(x => response.record.params[`managers.${x.id}`] = true)
    return response;
}

export const list_filter: After<ListActionResponse> = async (response, request, context) => {
    if(context.currentAdmin?.superadmin) return response;
    const user = (await prisma.user.findUnique({
        where: {
            email: context.currentAdmin?.email,
        },
        include: {
            shops: {
                select: {
                    id: true,
                }
            }
        }
    }))
    const shops = user?.shops.map(x => x.id) || []
    response.records = response.records.filter(r => shops.includes(r.params['id']))
    return response;
}

export const shopAdmin: ResourceWithOptions = {
    resource: {
        model: getModelByName('Shop'),
        client: prisma,
    },
    options: {
        navigation: { icon: 'ShoppingBag' },
        actions: {
            show: {
                after: after_many2many,
            },
            new: {
                after: after_many2many,
            },
            edit: {
                after: after_many2many,
            },
            list: {
                after: list_filter,
            },
        },
        properties: {
            managers: {
                description: "Managers",
                components: {
                    show: valueslistComponent,
                    edit: checkboxesComponent,
                },
                custom: {
                    values: (await prisma.user.findMany({
                        select: {
                            id: true,
                            email: true,
                        },
                    })).reduce((acc: any, v) => {
                        acc[v['id']] = v['email'];
                        return acc;
                    }, {}),
                }
            },
        },
    }
}