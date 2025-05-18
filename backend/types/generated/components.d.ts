import type { Schema, Struct } from '@strapi/strapi';

export interface OrderOrderLine extends Struct.ComponentSchema {
  collectionName: 'components_order_order_lines';
  info: {
    description: '';
    displayName: 'Order line';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    qty: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'order.order-line': OrderOrderLine;
    }
  }
}
