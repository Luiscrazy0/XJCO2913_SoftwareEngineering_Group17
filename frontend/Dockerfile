FROM node:22-alpine AS builder
ARG VITE_AMAP_JS_KEY
ARG VITE_AMAP_SECURITY_JS_CODE
ENV VITE_AMAP_JS_KEY=$VITE_AMAP_JS_KEY
ENV VITE_AMAP_SECURITY_JS_CODE=$VITE_AMAP_SECURITY_JS_CODE
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
