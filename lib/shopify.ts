import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
  throw new Error('Missing Shopify API credentials');
}

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: (process.env.SHOPIFY_SCOPES || 'read_customers,read_orders,read_products').split(','),
  hostName: 'localhost:3000',
  hostScheme: 'http',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: false,
  isCustomStoreApp: false,
});