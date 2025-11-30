import '@shopify/shopify-api/adapters/node';
import {shopifyApi, ApiVersion, Session} from '@shopify/shopify-api';

export const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SHOPIFY_API_SCOPES!.split(',') || [],
    hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000',
    hostScheme: 'http',
    apiVersion: ApiVersion.October24,
    isEmbeddedApp: false,
});

export function createShopifySession(shop: string, accessToken: string): Session {
    return new Session({
        id: `offline_${shop}`,
        shop,
        state: 'offline',
        isOnline: false,
        accessToken,
    });
}