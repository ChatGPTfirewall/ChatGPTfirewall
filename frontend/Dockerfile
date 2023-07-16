FROM node:18.16.1

WORKDIR /app

COPY package.json ./

COPY . ./

RUN npm install

CMD [ "npm", "run", "dev" ]