/**
 * order controller
 */

import { factories } from '@strapi/strapi'


async function handle(event) {
  const { result } = event;
  if(result.payment_method == "preorder") {
    await strapi.service('api::preorder.preorder').updateUsed(result.payment_infos);
  }
}


export default {
  async afterCreate(event) {
    await handle(event);
  },
  async afterUpdate(event) {
    await handle(event);
  },
  async afterDelete(event) {
    const { params } = event;
    if(params.data.payment_method == "preorder") {
      await strapi.service('api::preorder.preorder').updateUsed(params.data.payment_infos);
    }
  },
};

