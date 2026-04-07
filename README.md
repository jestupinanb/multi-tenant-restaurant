# Multi-Tenant Restaurant API

A multi-tenant restaurant ordering API built with NestJS and MongoDB, demonstrating tenant-scoped data isolation for the TicTuk backend engineering assessment.

## Multi-Tenancy Design

This API uses a shared-database multi-tenancy approach where all tenants (restaurants) share a single MongoDB instance. Tenant isolation is enforced through a `restaurantId` foreign key on the `MenuItem` and `Order` collections. This pattern fits the "thousands of franchises" scale described in the assessment — it avoids the operational overhead of database-per-tenant while compound indexes on `restaurantId` keep queries performant regardless of tenant count.

Every API request is scoped by the `restaurantId` extracted from the URL path (`/restaurants/:restaurantId/...`). Queries always filter by this value, so a restaurant can only access its own menu items and orders — attempting to access another tenant's data returns a 404. Orders store the item name and price at the time of submission (price denormalization) to preserve historical accuracy even if menu prices change later.

## Prerequisites

- Node.js >= 18
- pnpm
- Docker and Docker Compose

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd multi-tenant-restaurant
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start MongoDB**

   ```bash
   docker-compose up -d
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   ```

5. **Run the server**

   ```bash
   pnpm run start:dev
   ```

6. **Seed the database**

   ```bash
   pnpm run seed
   ```

The seed script is idempotent -- safe to run multiple times. It creates 2 restaurants, 5 menu items each, and 10 orders each.

## Running Tests

```bash
pnpm run test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/restaurants/:restaurantId/menu-items` | Create a menu item |
| GET | `/restaurants/:restaurantId/menu-items` | List all menu items |
| GET | `/restaurants/:restaurantId/menu-items/:itemId` | Get a menu item |
| PATCH | `/restaurants/:restaurantId/menu-items/:itemId` | Update a menu item |
| DELETE | `/restaurants/:restaurantId/menu-items/:itemId` | Delete a menu item |
| POST | `/restaurants/:restaurantId/orders` | Submit an order |

A Postman collection is included at `postman-collection.json` for testing all endpoints.

## Project Structure

```
src/
  restaurants/    # Restaurant entity and service
  menu-items/     # Menu item CRUD (tenant-scoped)
  orders/         # Order submission (tenant-scoped)
  common/         # Shared filters and pipes
  seed.ts         # Database seed script
```
