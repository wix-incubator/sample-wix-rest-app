FROM node:12-alpine

RUN apk add --no-cache git

WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3000
COPY . /app
CMD ["npm", "start"]
