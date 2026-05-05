# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_KAKAO_MAP_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY
RUN npm run build

# --- runtime (nginx static serving) ---
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA fallback
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
