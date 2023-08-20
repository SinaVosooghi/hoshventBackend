FROM node:18-alpine As production

RUN mkdir -p /app/src/backend  


RUN chown node:node /app/src/backend

WORKDIR /app/src/backend

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production 

COPY --chown=node:node /var/www/tenant /var/www/tenant  

CMD [ "node", "dist/main.js" ]

