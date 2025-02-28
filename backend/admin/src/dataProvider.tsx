import { DataProvider, GetListResult, RaRecord } from "react-admin";
import { trpc } from "./common";

type Record = RaRecord

export const dataProvider: DataProvider = {
    // @ts-ignore
    getList: async (resource, params) => {
        const r = await trpc.userList.query()
        return {data: r, total: r.length};
    },
    // @ts-ignore
    getOne: async (resource, params) => {
        const r = await trpc.userGetById.query(parseInt(params.id as string))
        return {data: r};
    },
    // @ts-ignore
    getMany: async (resource, params) => {
        return {data: []};
    },
    // @ts-ignore
    getManyReference: async (resource, params) => {
        return {data: []};
    },
    // @ts-ignore
    create: async (resource, params) => {
        return {data: {}};
    },
    // @ts-ignore
    update: async (resource, params) => {
        return {data: {}};
    },
    // @ts-ignore
    updateMany: async (resource, params) => {
        return {data: []};
    },
    // @ts-ignore
    delete: async (resource, params) => {
        return {data: {}};
    },
    // @ts-ignore
    deleteMany: async (resource, params) => {
        return {data: []};
    },
}
