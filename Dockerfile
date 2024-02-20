FROM node:21-alpine3.18

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

# RUN npm run build

COPY . .

EXPOSE 8000 8080

CMD npm run start:dev
