FROM node:19.5.0-alpine As production

RUN mkdir -p /app/src/backend  

RUN /app/src/backend

RUN  /var/www/tenant 

WORKDIR /app/src/backend


COPY package*.json ./

RUN npm ci

COPY  . .

RUN npm run build

ENV NODE_ENV production 

CMD [ "node", "dist/main.js" ]

