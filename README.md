# NestJS gRPC Microservices POC

A production-style proof of concept demonstrating inter-service communication using gRPC with NestJS microservices.

## Architecture

```
                         +----------------------------------+
                         |           Clients                |
                         |   (Browser, Mobile, CLI, etc.)   |
                         +---------------+-----------------+
                                         | HTTP/REST
                                         v
                         +-------------------------------+
                         |        API Gateway             |
                         |     (NestJS HTTP :3000)        |
                         |                                |
                         |  +---------+  +------------+   |
                         |  |  User   |  |   Order    |   |
                         |  | Module  |  |  Module    |   |
                         |  +----+----+  +-----+------+   |
                         +-------+-------------+---------+
                                 |             |
                          gRPC   |             |  gRPC
                        (proto)  |             |  (proto)
                                 |             |
                    +------------v--+    +-----v----------+
                    |  User Service |    | Order Service   |
                    |  (gRPC :5001) |    | (gRPC :5002)    |
                    |               |    |                 |
                    | - GetUser     |    | - GetOrder      |
                    | - GetUsers    |    | - GetOrders     |
                    | - CreateUser  |    | - CreateOrder   |
                    +---------------+    +-----------------+
```

## Why gRPC Over REST for Inter-Service Communication?

| Aspect | gRPC | REST (JSON) |
|---|---|---|
| **Serialization** | Protocol Buffers (binary, compact) | JSON (text, verbose) |
| **Performance** | ~10x faster serialization/deserialization | Slower due to text parsing |
| **Contract** | Strict `.proto` schema, code generation | OpenAPI/Swagger (optional, often drifts) |
| **Streaming** | Native bidirectional streaming | Requires WebSockets or SSE |
| **Type Safety** | Generated TypeScript interfaces from proto | Manual type definitions |
| **HTTP Version** | HTTP/2 (multiplexed, persistent connections) | Typically HTTP/1.1 |

For **client-facing** APIs, REST remains the standard (browser compatibility, caching, simplicity). For **internal service-to-service** communication, gRPC provides stronger contracts, better performance, and native streaming.

## Tech Stack

- **NestJS 11** - Progressive Node.js framework
- **@nestjs/microservices** - Microservice transport layer
- **@grpc/grpc-js** - Pure JavaScript gRPC client/server
- **@grpc/proto-loader** - Runtime proto file loading
- **Protocol Buffers (proto3)** - Interface definition language
- **Docker & Docker Compose** - Container orchestration
- **TypeScript 5** - Type-safe development

## Project Structure

```
├── proto/                          # Shared protobuf definitions
│   ├── user.proto
│   └── order.proto
├── apps/
│   ├── api-gateway/src/            # HTTP gateway (port 3000)
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   └── user.module.ts
│   │   └── order/
│   │       ├── order.controller.ts
│   │       └── order.module.ts
│   ├── user-service/src/           # gRPC server (port 5001)
│   │   ├── main.ts
│   │   ├── user.controller.ts
│   │   └── user.module.ts
│   └── order-service/src/          # gRPC server (port 5002)
│       ├── main.ts
│       ├── order.controller.ts
│       └── order.module.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (for containerized setup)

### Local Development

```bash
# Install dependencies
npm install

# Start all three services (in separate terminals)
npm run start:user-service
npm run start:order-service
npm run start:api-gateway
```

### Docker Compose

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

### Testing the API

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Get all users
curl http://localhost:3000/users

# Get a single user
curl http://localhost:3000/users/1

# Create an order
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"userId": "1", "product": "NestJS in Action", "quantity": 2, "price": 39.99}'

# Get all orders
curl http://localhost:3000/orders

# Get a single order
curl http://localhost:3000/orders/1
```

## Service Ports

| Service | Protocol | Port |
|---|---|---|
| API Gateway | HTTP | 3000 |
| User Service | gRPC | 5001 |
| Order Service | gRPC | 5002 |
