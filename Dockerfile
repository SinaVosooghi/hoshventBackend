FROM node:18-alpine As production

RUN mkdir -p /app/src/backend  

RUN mkdir -p /var/www/tenant 

COPY tenant/* /var/www/tenant 

RUN chown node:node /app/src/backend

RUN chown node:node /var/www/tenant 

WORKDIR /app/src/backend

USER node

COPY --chown=node:node package*.json .

COPY --chown=node:node . .

ENV NODE_ENV production 

RUN npm ci

RUN npm run build

CMD [ "node", "dist/main.js" ]

