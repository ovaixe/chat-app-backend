FROM node:21-alpine3.18

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8082

CMD npm run start:dev
