/**
 * preorder service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::preorder.preorder', ({ strapi }) => ({

  async updateUsed(uuid: string) {
    const preorder = await strapi.documents('api::preorder.preorder').findFirst({ filters: { uid: { $eq: uuid } } });
    if(!preorder) {
      console.log(`Invalid preorder uuid ${uuid}!`);
      return;
    }

    const orders = await strapi.documents('api::order.order').findMany({ filters: { payment_method: { $eq: "preorder" }, payment_infos: { $eq: preorder.uid } } });
    const total = orders.reduce((sum, order) => sum + order.total * (order.refund?-1:+1), 0);

    await strapi.documents('api::preorder.preorder').update({
      documentId: preorder.documentId,
      data: { used: total }
    });

    console.log(`Preorder uuid ${preorder.uid} updated to total ${total}.`);
  }

}));
