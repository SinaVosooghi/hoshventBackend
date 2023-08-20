FROM node:18-alpine As production

RUN mkdir -p /app/src/backend  

RUN mkdir -p /var/www/tenant 

RUN chown node:node /app/src/backend

COPY tenant/* /var/www/tenant 

RUN chown node:node /var/www/tenant 

WORKDIR /app/src/backend

USER node

COPY --chown=node:node package*.json ./backend

RUN npm ci

COPY --chown=node:node .backend .

RUN npm run build

ENV NODE_ENV production 


CMD [ "node", "dist/main.js" ]

