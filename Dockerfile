FROM node:18.14-bullseye-slim as builder

WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm install

COPY *.json *.js ./
COPY src src/
RUN npm run build --prod


FROM nginx:1.24-bullseye

COPY --from=builder /srv/app/dist/positif/ /usr/share/nginx/html/

