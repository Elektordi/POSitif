
export default {
  routes: [
    {
      method: 'POST',
      path: '/config/token',
      handler: 'stripe.token',
    }
  ]
}
