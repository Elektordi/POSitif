export default {
  afterCreate(event) {
    const { result, params } = event;

    // @ts-ignore
    strapi.$io.raw("ticket:create", {id: result.id});
  },
};
