FROM node:20-alpine AS deps
WORKDIR /repo
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
WORKDIR /repo
COPY . .
RUN npm run build -w web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
COPY apps/web/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY --from=build /repo/apps/web/.next ./.next
COPY --from=build /repo/apps/web/app ./app
COPY --from=build /repo/apps/web/components ./components
COPY --from=build /repo/apps/web/lib ./lib
COPY --from=build /repo/apps/web/store ./store
COPY --from=build /repo/apps/web/next.config.js ./next.config.js
COPY --from=build /repo/apps/web/public ./public
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
