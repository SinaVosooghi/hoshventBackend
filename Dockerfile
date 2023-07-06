FROM node:18-alpine As production

WORKDIR /app/src/backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV production 


CMD [ "node", "dist/main.js" ]

