FROM node:22-alpine as builder

WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm install

COPY *.json *.js ./
COPY src src/
ARG LANG=en
RUN echo "Building '${LANG}' version:" ; node_modules/.bin/ng build -c production,${LANG}


FROM nginx:1.27-alpine

COPY --from=builder /srv/app/dist/positif/* /usr/share/nginx/html

