FROM node:18-alpine As production

RUN mkdir -p /app/src/backend  

RUN mkdir -p /var/www/tenant 

COPY --chown=node:node tenant/* /var/www/tenant 

RUN chown node:node /app/src/backend

WORKDIR /app/src/backend

USER node

COPY --chown=node:node backend/package*.json .

COPY --chown=node:node . .

ENV NODE_ENV production 

RUN npm ci

RUN npm run build

CMD [ "node", "dist/main.js" ]

