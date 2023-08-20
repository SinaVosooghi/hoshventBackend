FROM node:18-alpine As production

RUN mkdir -p /app/src/backend  

RUN chown node:node /app/src/backend

RUN cp /var/www/tenant /var/www/tenant 

RUN chown node:node /var/www/tenant 


WORKDIR /app/src/backend

USER node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production 


CMD [ "node", "dist/main.js" ]

