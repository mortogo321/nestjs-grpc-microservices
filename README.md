# NestJS gRPC Microservices

A production-style proof of concept demonstrating gRPC inter-service communication using NestJS in a monorepo layout.

## Architecture

```
                         +---------------------+
                         |      Client          |
                         |  (curl / browser)    |
                         +----------+-----------+
                                    | HTTP
                                    v
                  +-------------------------------+
                  |        API Gateway            |
                  |     (NestJS - port 3000)      |
                  |                               |
                  |  GET/POST /users              |
                  |  GET/POST /orders             |
                  +------+---------------+--------+
                         |               |
                   gRPC  |               |  gRPC
                         v               v
          +------------------+  +------------------+
          |   User Service   |  |  Order Service   |
          |  (port 5001)     |  |  (port 5002)     |
          |                  |  |                  |
          |  In-memory store |  |  In-memory store |
          +------------------+  +------------------+
```

## Why gRPC over REST for inter-service communication?

| Concern | gRPC | REST (JSON) |
|---|---|---|
| **Serialization** | Protocol Buffers (binary) -- smaller payloads, faster encode/decode | JSON -- human-readable but verbose |
| **Latency** | HTTP/2 multiplexing, persistent connections, binary framing | HTTP/1.1 typically, text-based |
| **Type safety** | `.proto` contract shared across services; codegen guarantees type alignment | OpenAPI/Swagger optional, runtime validation |
| **Streaming** | Native bidirectional streaming built into the protocol | SSE or WebSocket bolted on |
| **Code generation** | First-class codegen for 10+ languages from a single `.proto` file | Manual client/server code or third-party generators |

For internal service-to-service calls where human readability is not required, gRPC delivers measurably lower latency and stronger compile-time guarantees.

## Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 20+ and npm for local development

## Quick start

```bash
# Build and start all services
docker-compose up --build

# In another terminal, test the endpoints
curl http://localhost:3000/users
curl http://localhost:3000/orders
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user (`{ "name": "...", "email": "..." }`) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/:id` | Get an order by ID |
| `POST` | `/orders` | Create an order (`{ "userId": "...", "product": "...", "quantity": 1, "price": 29.99 }`) |

## Local development (without Docker)

```bash
# Install dependencies
npm install

# Build all services
npm run build

# Start each service in separate terminals
npm run start:user-service
npm run start:order-service
npm run start:api-gateway
```

When running locally, update the gRPC client URLs in the gateway modules to point to `localhost` instead of the Docker service names.

## Project structure

```
.
+-- proto/                          # Shared protobuf definitions
|   +-- user.proto
|   +-- order.proto
+-- apps/
|   +-- api-gateway/src/            # HTTP entry point
|   |   +-- main.ts
|   |   +-- app.module.ts
|   |   +-- user/
|   |   +-- order/
|   +-- user-service/src/           # gRPC server for users
|   +-- order-service/src/          # gRPC server for orders
+-- docker-compose.yml
+-- Dockerfile
+-- nest-cli.json
+-- package.json
+-- tsconfig.json
```