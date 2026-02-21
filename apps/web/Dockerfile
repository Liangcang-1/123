FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY --from=build /app/.next ./.next
COPY --from=build /app/app ./app
COPY --from=build /app/components ./components
COPY --from=build /app/lib ./lib
COPY --from=build /app/store ./store
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
