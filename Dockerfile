FROM node:12 as build

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY src/ /app/src/
COPY *.json /app/

RUN npm run build -- --base-href "/static/spreadsheetui/" --prod --output-path=/dist/spreadsheetui/
