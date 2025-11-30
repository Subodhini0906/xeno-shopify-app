/* eslint-disable @typescript-eslint/no-explicit-any */
import { shopify, createShopifySession } from './shopify';
import { prisma } from './prisma';

export async function syncShopifyData(tenantId: string) {

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error('Tenant not found');

  const session = createShopifySession(tenant.shopifyDomain, tenant.shopifyToken);
  const client = new shopify.clients.Rest({ session });

  console.log(`🔄 Syncing data for ${tenant.shopifyDomain}...`);

  await syncCustomers(client, tenantId);

  await syncProducts(client, tenantId);

  await syncOrders(client, tenantId);

  console.log(`✅ Sync complete for ${tenant.shopifyDomain}`);
}

async function syncCustomers(client: any, tenantId: string) {
  const response = await client.get({ path: 'customers' });
  const customers = response.body.customers;

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId,
          shopifyCustomerId: customer.id.toString(),
        },
      },
      update: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        totalSpent: parseFloat(customer.total_spent || '0'),
        ordersCount: customer.orders_count || 0,
      },
      create: {
        tenantId,
        shopifyCustomerId: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        totalSpent: parseFloat(customer.total_spent || '0'),
        ordersCount: customer.orders_count || 0,
      },
    });
  }

  console.log(`✅ Synced ${customers.length} customers`);
}

async function syncProducts(client: any, tenantId: string) {
  const response = await client.get({ path: 'products' });
  const products = response.body.products;

  for (const product of products) {
    const variant = product.variants[0]; // Use first variant
    
    await prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId,
          shopifyProductId: product.id.toString(),
        },
      },
      update: {
        title: product.title,
        price: parseFloat(variant.price),
        inventory: variant.inventory_quantity || 0,
      },
      create: {
        tenantId,
        shopifyProductId: product.id.toString(),
        title: product.title,
        price: parseFloat(variant.price),
        inventory: variant.inventory_quantity || 0,
      },
    });
  }

  console.log(`✅ Synced ${products.length} products`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncOrders(client: any, tenantId: string) {
  const response = await client.get({ path: 'orders' });
  const orders = response.body.orders;

  for (const order of orders) {
    // Find or create customer first
    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        shopifyCustomerId: order.customer?.id.toString(),
      },
    });

    if (!customer) continue; // Skip if customer not found

    // Create order
    const createdOrder = await prisma.order.upsert({
      where: {
        tenantId_shopifyOrderId: {
          tenantId,
          shopifyOrderId: order.id.toString(),
        },
      },
      update: {
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderDate: new Date(order.created_at),
      },
      create: {
        tenantId,
        shopifyOrderId: order.id.toString(),
        customerId: customer.id,
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderDate: new Date(order.created_at),
      },
    });

    // Create order items
    for (const lineItem of order.line_items) {
      const product = await prisma.product.findFirst({
        where: {
          tenantId,
          shopifyProductId: lineItem.product_id.toString(),
        },
      });

      if (product) {
        await prisma.orderItem.upsert({
          where: {
            id: `${createdOrder.id}-${lineItem.id}`,
          },
          update: {
            quantity: lineItem.quantity,
            price: parseFloat(lineItem.price),
          },
          create: {
            id: `${createdOrder.id}-${lineItem.id}`,
            orderId: createdOrder.id,
            productId: product.id,
            quantity: lineItem.quantity,
            price: parseFloat(lineItem.price),
          },
        });
      }
    }
  }

  console.log(`✅ Synced ${orders.length} orders`);
}