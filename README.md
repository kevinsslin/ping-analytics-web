# PING Analytics Dashboard

Analytics dashboard for the PING token on Base network.

## Features

- Token statistics and historical charts
- Real-time swap and transfer monitoring
- Top holders analysis

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Recharts
- [Envio](https://envio.dev/) indexer

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Data Source

Indexer endpoint: `https://indexer.hyperindex.xyz/1c6c77c/v1/graphql`

Indexer repository: [ping-envio-indexing](https://github.com/kevinslin/ping-envio-indexing)

## Credits

Made by [Kevin Lin](https://github.com/kevinsslin)

Powered by [Envio](https://envio.dev/)
