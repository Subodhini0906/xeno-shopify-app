import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try{
        const callbackResponse = await shopify.auth.callback({
            rawRequest: request,
        });
        const {session} = callbackResponse;

        if(!session){
            return NextResponse.json({error: 'Failed to get session from Shopify'}, {status: 401});
        }

        await prisma.tenant.upsert({
            where: {shopifyDomain: session.shop},
            update: {
                shopifyToken: session.accessToken!,
                updatedAt: new Date(),
            },
            create: {
                shopifyDomain: session.shop,
                shopifyToken: session.accessToken!,
                storeName: session.shop,
                email: 'admin@'+session.shop,
            },
        });

        return NextResponse.redirect(new URL('/dashboard', request.url));
    }catch(error){
        console.error('Error during Shopify callback:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}