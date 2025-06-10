export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  async register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await strapi.admin.services.permission.conditionProvider.register({
      displayName: 'Is store manager',
      name: 'is-store-manager',
      async handler(user) {
        if(user.permission.subject == "api::category.category") {
          return { "store.managers": { $elemMatch: { id: user.id } } };
        }
        if(user.permission.subject == "api::order.order") {
          return { "store.managers": { $elemMatch: { id: user.id } } };
        }
        if(user.permission.subject == "api::preorder.preorder") {
          return { "store.managers": { $elemMatch: { id: user.id } } };
        }
        if(user.permission.subject == "api::product.product") {
          return { "store.managers": { $elemMatch: { id: user.id } } };
        }
        if(user.permission.subject == "api::store.store") {
          return { "managers": { $elemMatch: { id: user.id } } };
        }
        if(user.permission.subject == "api::category.category") {
          return {};
        }
        return false;
      },
    });
  },
};
