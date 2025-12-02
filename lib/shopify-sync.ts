/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma';

export async function syncShopifyData(tenantId: string) {
  // Get tenant credentials
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error('Tenant not found');

  console.log(`🔄 Syncing data for ${tenant.shopifyDomain}...`);

  const shopifyDomain = tenant.shopifyDomain;
  const accessToken = tenant.shopifyToken;

  // Sync Customers
  await syncCustomers(shopifyDomain, accessToken, tenantId);

  // Sync Products
  await syncProducts(shopifyDomain, accessToken, tenantId);

  // Sync Orders
  await syncOrders(shopifyDomain, accessToken, tenantId);

  console.log(`✅ Sync complete for ${tenant.shopifyDomain}`);
}

async function syncCustomers(shop: string, accessToken: string, tenantId: string) {
  try {
    console.log(`📞 Fetching customers from ${shop}...`);
    console.log(`🔑 Using token: ${accessToken.substring(0, 10)}...`);
    
    const url = `https://${shop}/admin/api/2024-10/customers.json`;
    console.log(`🌐 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Response error:`, errorText);
      throw new Error(`Failed to fetch customers: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const customers = data.customers || [];

    console.log(`📥 Fetched ${customers.length} customers`);

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
  } catch (error: any) {
    console.error('❌ Error syncing customers:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
}

async function syncProducts(shop: string, accessToken: string, tenantId: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-10/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    console.log(`📥 Fetched ${products.length} products`);

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
          price: parseFloat(variant?.price || '0'),
          inventory: variant?.inventory_quantity || 0,
        },
        create: {
          tenantId,
          shopifyProductId: product.id.toString(),
          title: product.title,
          price: parseFloat(variant?.price || '0'),
          inventory: variant?.inventory_quantity || 0,
        },
      });
    }

    console.log(`✅ Synced ${products.length} products`);
  } catch (error: any) {
    console.error('❌ Error syncing products:', error.message);
    throw error;
  }
}

async function syncOrders(shop: string, accessToken: string, tenantId: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-10/orders.json?status=any`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    console.log(`📥 Fetched ${orders.length} orders`);

    for (const order of orders) {
      // Find or create customer first
      let customer = await prisma.customer.findFirst({
        where: {
          tenantId,
          shopifyCustomerId: order.customer?.id?.toString(),
        },
      });

      // If customer doesn't exist and order has customer data, create them
      if (!customer && order.customer) {
        customer = await prisma.customer.create({
          data: {
            tenantId,
            shopifyCustomerId: order.customer.id.toString(),
            email: order.customer.email,
            firstName: order.customer.first_name,
            lastName: order.customer.last_name,
            phone: order.customer.phone,
            totalSpent: parseFloat(order.customer.total_spent || '0'),
            ordersCount: order.customer.orders_count || 0,
          },
        });
      }

      if (!customer) {
        console.log(`⚠️ Skipping order ${order.id} - no customer found`);
        continue;
      }

      // Create order
      const createdOrder = await prisma.order.upsert({
        where: {
          tenantId_shopifyOrderId: {
            tenantId,
            shopifyOrderId: order.id.toString(),
          },
        },
        update: {
          orderNumber: order.order_number?.toString() || order.name,
          totalPrice: parseFloat(order.total_price || '0'),
          currency: order.currency || 'USD',
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          orderDate: new Date(order.created_at),
        },
        create: {
          tenantId,
          shopifyOrderId: order.id.toString(),
          customerId: customer.id,
          orderNumber: order.order_number?.toString() || order.name,
          totalPrice: parseFloat(order.total_price || '0'),
          currency: order.currency || 'USD',
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          orderDate: new Date(order.created_at),
        },
      });

      // Create order items
      for (const lineItem of order.line_items || []) {
        let product = await prisma.product.findFirst({
          where: {
            tenantId,
            shopifyProductId: lineItem.product_id?.toString(),
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
  } catch (error: any) {
    console.error('❌ Error syncing orders:', error.message);
    throw error;
  }
}