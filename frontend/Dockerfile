FROM node:current-bullseye-slim as dev

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

RUN echo "VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN" > .env.local && \
    echo "VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID" >> .env.local && \
    echo "VITE_JWT_AUDIENCE=$VITE_JWT_AUDIENCE" >> .env.local && \
    echo "VITE_JWT_ISSUER=$VITE_JWT_ISSUER" >> .env.local

COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

FROM node:current-bullseye-slim as prod

ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_JWT_AUDIENCE
ARG VITE_JWT_ISSUER

ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID \
    VITE_JWT_AUDIENCE=$VITE_JWT_AUDIENCE \
    VITE_JWT_ISSUER=$VITE_JWT_ISSUER

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN echo "VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN" > .env.production.local && \
    echo "VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID" >> .env.production.local && \
    echo "VITE_JWT_AUDIENCE=$VITE_JWT_AUDIENCE" >> .env.production.local && \
    echo "VITE_JWT_ISSUER=$VITE_JWT_ISSUER" >> .env.production.local

COPY . .

RUN npm run build

# Prod Stage
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

RUN mkdir -p /etc/nginx/ssl

COPY --from=prod /app/dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
