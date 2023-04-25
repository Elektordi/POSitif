import Stripe from 'stripe';


export default {
  async token(ctx, next) {
    const config = await strapi.entityService.findMany('api::config.config');
    const stripe = new Stripe(config.stripe_private_key, {'apiVersion': '2022-11-15'});
    const connectionToken = await stripe.terminal.connectionTokens.create();
    ctx.body = {
      'stripe_public_key': config.stripe_public_key,
      'stripe_terminal_key': connectionToken.secret,
    };
  },
};
