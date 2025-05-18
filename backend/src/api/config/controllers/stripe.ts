import Stripe from 'stripe';


export default {
  async token(ctx, next) {
    const config = await strapi.documents('api::config.config').findFirst();
    const stripe = new Stripe(config.stripe_private_key, {'apiVersion': '2022-11-15'});
    const connectionToken = await stripe.terminal.connectionTokens.create();
    ctx.body = {
      'data': connectionToken.secret,
    };
  },
};
