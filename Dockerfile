FROM node:8
# Create app directory
WORKDIR /usr/src/appPractica
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .
EXPOSE 3500
CMD [ "npm", "start" ]