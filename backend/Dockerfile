FROM node:22-alpine as build
ARG NODE_ENV=production
WORKDIR /srv/
COPY ./package.json ./package-lock.json ./
ENV PATH /srv/node_modules/.bin:$PATH
RUN npm install --production
WORKDIR /srv/app
COPY . .
RUN npm run build


FROM node:22-alpine
ARG NODE_ENV=production
WORKDIR /srv/app
COPY --from=build /srv/node_modules ./node_modules
ENV PATH /srv/node_modules/.bin:$PATH
COPY --from=build /srv/app ./
EXPOSE 1337
CMD ["npm", "run","start"]
