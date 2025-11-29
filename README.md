# Xeno Shopify Data Ingestion & Insights Service

A multi-tenant Shopify data ingestion and analytics platform that enables enterprise retailers to onboard, integrate, and analyze their customer data.

## 🚀 Features

- **Multi-tenant Architecture**: Isolated data storage per Shopify store
- **Shopify Integration**: Automated sync of customers, orders, and products
- **Real-time Dashboard**: Visual insights into business metrics
- **Email Authentication**: Secure user access control
- **RESTful APIs**: Clean API endpoints for data operations
- **Automated Sync**: Scheduled and webhook-based data synchronization

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)
- [Assumptions](#assumptions)

---

## 🛠 Tech Stack

### Backend
- **Node.js** with **Next.js 14** (App Router)
- **Prisma ORM** for database management
- **PostgreSQL** as the primary database
- **Shopify Admin REST API** for data ingestion

### Frontend
- **React 18** with **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **NextAuth.js** for authentication

### Deployment
- **Vercel** (Frontend + API Routes)
- **Railway/Render** (PostgreSQL Database)

---

## 🏗 Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │  Mobile App  │  │  Webhooks    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Next.js)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Authentication Middleware                  │ │
│  │                  (NextAuth.js)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth APIs   │  │  Sync APIs   │  │ Dashboard UI │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Shopify Integration Service                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   OAuth 2.0  │  │  Data Sync   │  │  Webhooks   │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Multi-Tenant Data Handler                  │ │
│  │           (Tenant Isolation via tenantId)               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Prisma ORM                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  PostgreSQL Database                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Tenants  │ │Customers │ │  Orders  │ │ Products │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Shopify Admin API                          │ │
│  │    (Customers, Orders, Products, Webhooks)              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Store Connection Flow:
   User → Auth Endpoint → Shopify OAuth → Callback → Save Tenant

2. Data Sync Flow:
   Scheduler/Manual Trigger → Sync API → Shopify API → Parse Data → 
   → Prisma ORM → PostgreSQL (with tenant isolation)

3. Dashboard Flow:
   User Login → Dashboard → API Request → Prisma Query (filtered by tenantId) → 
   → Return Data → Recharts Visualization
```

---

## 📦 Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed and running
- **Shopify Partner Account** (free)
- **Shopify Development Store** created

### 1. Clone the Repository

```bash
git clone https://github.com/Subodhini0906/xeno-shopify-app.git
cd xeno-shopify-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE xeno_shopify;

# Exit
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/xeno_shopify"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# Shopify API
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
SHOPIFY_APP_URL="http://localhost:3000"
SHOPIFY_SCOPES="read_customers,read_orders,read_products,read_inventory"
```

### 5. Set Up Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Navigate to **Apps** → **Create App** → **Create app manually**
3. Configure app settings:
   - **App URL**: `http://localhost:3000`
   - **Allowed redirection URL(s)**: `http://localhost:3000/api/auth/callback`
4. Under **API credentials**:
   - Copy **API key** and **API secret key** to `.env`
   - Select scopes: `read_customers`, `read_orders`, `read_products`, `read_inventory`
5. Install the app to your development store

### 6. Initialize Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate


### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 8. Connect Your Shopify Store

Navigate to:
```
http://localhost:3000/api/auth/shopify?shop=YOUR-STORE-NAME.myshopify.com
```

Replace `YOUR-STORE-NAME` with your actual store name.

### 9. Sync Data

Trigger initial sync via API:

```bash
curl -X POST http://localhost:3000/api/sync
```

Or use the sync button in the dashboard UI.

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     Tenant      │
│─────────────────│
│ id (PK)         │
│ shopifyDomain   │◄─────────┐
│ shopifyToken    │          │
│ storeName       │          │
│ email           │          │
│ createdAt       │          │
│ updatedAt       │          │
└─────────────────┘          │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Customer     │  │    Product      │  │     Order      │
│────────────────│  │─────────────────│  │────────────────│
│ id (PK)        │  │ id (PK)         │  │ id (PK)        │
│ tenantId (FK)  │  │ tenantId (FK)   │  │ tenantId (FK)  │
│ shopifyId      │  │ shopifyId       │  │ shopifyOrderId │
│ email          │  │ title           │  │ customerId (FK)│◄──┐
│ firstName      │  │ price           │  │ orderNumber    │   │
│ lastName       │  │ inventory       │  │ totalPrice     │   │
│ phone          │  │ createdAt       │  │ currency       │   │
│ totalSpent     │  │ updatedAt       │  │ orderDate      │   │
│ ordersCount    │  └─────────────────┘  │ createdAt      │   │
│ createdAt      │           │           │ updatedAt      │   │
│ updatedAt      │           │           └────────────────┘   │
└────────────────┘           │                    │           │
                             │                    │           │
                             │           ┌────────▼───────┐   │
                             │           │   OrderItem    │   │
                             │           │────────────────│   │
                             │           │ id (PK)        │   │
                             │           │ orderId (FK)   │───┘
                             └───────────┤ productId (FK) │
                                         │ quantity       │
                                         │ price          │
                                         └────────────────┘

┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email           │
│ password        │
│ name            │
│ tenantId        │
│ createdAt       │
└─────────────────┘
```

### Tables

#### Tenants
Stores Shopify store credentials and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| shopifyDomain | String (Unique) | Store's Shopify domain |
| shopifyToken | String | OAuth access token |
| storeName | String | Display name |
| email | String | Store admin email |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Customers
Customer data from Shopify stores.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| tenantId | String (FK) | Reference to tenant |
| shopifyCustomerId | String | Shopify customer ID |
| email | String | Customer email |
| firstName | String | First name |
| lastName | String | Last name |
| phone | String | Phone number |
| totalSpent | Float | Total amount spent |
| ordersCount | Int | Number of orders |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Products
Product catalog from Shopify.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| tenantId | String (FK) | Reference to tenant |
| shopifyProductId | String | Shopify product ID |
| title | String | Product name |
| price | Float | Product price |
| inventory | Int | Stock quantity |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### Orders
Order transactions from Shopify.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| tenantId | String (FK) | Reference to tenant |
| shopifyOrderId | String | Shopify order ID |
| customerId | String (FK) | Reference to customer |
| orderNumber | String | Order number |
| totalPrice | Float | Total order value |
| currency | String | Currency code |
| financialStatus | String | Payment status |
| fulfillmentStatus | String | Shipping status |
| orderDate | DateTime | Order date |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### OrderItems
Line items within orders.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| orderId | String (FK) | Reference to order |
| productId | String (FK) | Reference to product |
| quantity | Int | Quantity ordered |
| price | Float | Unit price |

#### Users
Application users for authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| email | String (Unique) | User email |
| password | String | Hashed password |
| name | String | Display name |
| tenantId | String | Associated tenant |
| createdAt | DateTime | Creation timestamp |

---

## 🔌 API Endpoints

### Authentication

#### `GET /api/auth/shopify`
Initiates Shopify OAuth flow.

**Query Parameters:**
- `shop` (required): Shopify store domain (e.g., `mystore.myshopify.com`)

**Response:**
- Redirects to Shopify authorization page

**Example:**
```bash
curl "http://localhost:3000/api/auth/shopify?shop=mystore.myshopify.com"
```

---

#### `GET /api/auth/callback`
Handles Shopify OAuth callback.

**Query Parameters:**
- `code`: Authorization code from Shopify
- `shop`: Store domain
- `state`: CSRF token

**Response:**
- Redirects to dashboard on success
- Returns error JSON on failure

---

### Data Synchronization

#### `POST /api/sync`
Triggers data sync from Shopify.

**Request Body:**
```json
{
  "tenantId": "optional-tenant-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 1 tenants"
}
```

**Example:**
```bash
# Sync all tenants
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{}'

# Sync specific tenant
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "clx123abc"}'
```

---

### Dashboard Data

#### `GET /api/dashboard/metrics`
Retrieves key business metrics.

**Query Parameters:**
- `tenantId` (required): Tenant identifier

**Response:**
```json
{
  "totalCustomers": 150,
  "totalOrders": 450,
  "totalRevenue": 125000.50,
  "averageOrderValue": 277.78
}
```

---

#### `GET /api/dashboard/orders`
Retrieves orders with date filtering.

**Query Parameters:**
- `tenantId` (required): Tenant identifier
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "orders": [
    {
      "id": "order_123",
      "orderNumber": "1001",
      "totalPrice": 299.99,
      "orderDate": "2025-01-15T10:30:00Z",
      "customer": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 450
}
```

---

#### `GET /api/dashboard/top-customers`
Retrieves top customers by spend.

**Query Parameters:**
- `tenantId` (required): Tenant identifier
- `limit` (optional): Number of customers (default: 5)

**Response:**
```json
{
  "customers": [
    {
      "id": "cust_123",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "totalSpent": 5420.50,
      "ordersCount": 12
    }
  ]
}
```

---

### Webhooks

#### `POST /api/webhooks/customers/create`
Handles customer creation webhook from Shopify.

**Headers:**
- `X-Shopify-Shop-Domain`: Store domain
- `X-Shopify-Hmac-Sha256`: Webhook signature

**Request Body:**
```json
{
  "id": 12345,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

#### `POST /api/webhooks/orders/create`
Handles order creation webhook from Shopify.

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Random 32-character string |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `SHOPIFY_API_KEY` | Shopify app API key | From Partners dashboard |
| `SHOPIFY_API_SECRET` | Shopify app secret | From Partners dashboard |
| `SHOPIFY_APP_URL` | App callback URL | `http://localhost:3000` |
| `SHOPIFY_SCOPES` | API permission scopes | `read_customers,read_orders,read_products` |

---

## ⚠️ Known Limitations

1. **Rate Limiting**: Shopify API has rate limits (40 requests/second). Large stores may experience throttling during initial sync.

2. **Historical Data**: Only fetches recent data from Shopify (last 250 records per endpoint by default). Full historical sync requires pagination implementation.

3. **Webhook Reliability**: Webhooks may occasionally fail. A scheduled sync job is recommended as a backup.

4. **No Real-time Updates**: Dashboard data refreshes on page load, not in real-time. WebSocket implementation needed for live updates.

5. **Single Currency**: Currently assumes USD. Multi-currency conversion not implemented.

6. **No Data Deletion Sync**: When data is deleted in Shopify, it's not automatically removed from our database.

7. **Limited Error Handling**: API errors are logged but not always gracefully handled in UI.

8. **No Bulk Operations**: All syncs are sequential, which can be slow for large datasets.

9. **Authentication**: Simple email/password auth without 2FA or advanced security features.

10. **No Data Export**: No built-in functionality to export dashboard data to CSV/Excel.

---

## 📝 Assumptions

1. **Single Store per Tenant**: Each tenant represents one Shopify store (multi-store management not implemented).

2. **English Language**: UI and error messages are in English only.

3. **Product Variants**: Only the first variant of each product is synced for simplicity.

4. **Order Status**: We store financial and fulfillment status as-is from Shopify without business logic.

5. **Customer Uniqueness**: Customers are identified by Shopify customer ID, not email (same email can exist across tenants).

6. **Development Environment**: Configuration optimized for local development, not production-scale traffic.

7. **Data Freshness**: Dashboard shows data as of last sync, not real-time Shopify data.

8. **Network Reliability**: Assumes stable internet connection for API calls.

9. **PostgreSQL Hosting**: Database hosted separately (not in-memory or SQLite).

10. **OAuth Flow**: Users must complete full OAuth flow for each store connection.

---

## 🙏 Acknowledgments

- [Shopify](https://shopify.dev) for comprehensive API documentation
- [Prisma](https://prisma.io) for excellent ORM tooling
- [Next.js](https://nextjs.org) for the amazing framework
- [Xeno](https://getxeno.com) for the internship opportunity
