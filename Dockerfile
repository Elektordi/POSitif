FROM node:18.14-bullseye-slim as builder

WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm install

COPY *.json *.js ./
COPY src src/
ARG LANG=en
RUN echo "Building '${LANG}' version:" ; node_modules/.bin/ng build -c production,${LANG}


FROM nginx:1.24-bullseye

COPY --from=builder /srv/app/dist/positif/* /usr/share/nginx/html

