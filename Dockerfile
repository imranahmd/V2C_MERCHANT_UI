FROM node:18.20.5

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install -g @angular/cli

RUN npm install --legacy-peer-deps

CMD ["npm", "start"]

#CMD ["ng", "serve", "--host", "0.0.0.0"]