FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY db ./db
COPY .env.example ./.env.example

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

USER node

CMD ["node", "src/server.js"]
