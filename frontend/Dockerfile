FROM node:18.16.1

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . ./

CMD [ "npm", "run", "dev" ]