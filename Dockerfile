FROM node:18
WORKDIR /usr/src/app
RUN yarn global add pm2
COPY package.json ./
COPY yarn.lock ./
RUN rm -rf node_modules && yarn install --production --frozen-lockfile && yarn cache clean
COPY . .
EXPOSE 3000

CMD [ "pm2-runtime", "server.js" ]