/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get('shop');

    if (!shop) {
      return NextResponse.json(
        { error: 'Missing shop parameter' },
        { status: 400 }
      );
    }

    // Validate shop domain
    const shopDomain = shop.includes('.myshopify.com') 
      ? shop 
      : `${shop}.myshopify.com`;

    // Build OAuth URL manually
    const scopes = process.env.SHOPIFY_SCOPES || 'read_customers,read_orders,read_products';
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?` + 
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Shopify auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}