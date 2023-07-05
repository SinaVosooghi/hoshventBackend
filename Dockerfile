FROM node:18-alpine As production

WORKDIR /app/src/backend

COPY --chown=node:node package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV production 

USER node

CMD [ "node", "dist/main.js" ]

