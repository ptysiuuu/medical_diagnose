# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY app/frontend/package.json app/frontend/package-lock.json ./

RUN npm ci

COPY app/frontend ./

RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
