FROM node:16-alpine as build
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1
ARG NODE_ENV=production
WORKDIR /srv/
COPY ./package.json ./package-lock.json ./
ENV PATH /srv/node_modules/.bin:$PATH
RUN npm install --production
WORKDIR /srv/app
COPY ./ .
RUN npm run build


FROM node:16-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk add vips-dev && rm -rf /var/cache/apk/*
ARG NODE_ENV=production
WORKDIR /srv/app
COPY --from=build /srv/node_modules ./node_modules
ENV PATH /srv/node_modules/.bin:$PATH
COPY --from=build /srv/app ./
EXPOSE 1337
CMD ["npm", "run","start"]
