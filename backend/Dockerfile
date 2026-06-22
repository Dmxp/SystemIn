FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm config set strict-ssl false
RUN npm install --no-audit --no-fund

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]