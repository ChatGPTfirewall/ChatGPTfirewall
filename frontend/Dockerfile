FROM node
WORKDIR /app
COPY . .
RUN npm install
RUN npm install esbuild
CMD ["npm", "run" , "dev"]
# CMD [ "tail", "-f", "/dev/null"]