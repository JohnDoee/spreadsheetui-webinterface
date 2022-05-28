FROM node:16 as build

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY src/ /app/src/
COPY *.json /app/

RUN npm run build -- --configuration production --output-path=/dist/spreadsheetui/
