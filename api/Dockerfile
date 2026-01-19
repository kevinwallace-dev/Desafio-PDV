# Multi-stage build to compile TypeScript with devDependencies,
# then produce a slim runtime image with only production deps.

FROM node:20-alpine AS builder
WORKDIR /app

# Install all deps (including dev) to build TypeScript
COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Install only production deps for a slimmer image
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
