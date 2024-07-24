FROM node:10

RUN mkdir -p /usr/truckLink

COPY /. /usr/truckLink/backend

WORKDIR /usr/truckLink/backend

RUN npm i 

RUN npm i --g pm2

EXPOSE 3000

CMD ["pm2-runtime","/usr/truckLink/backend/app/server.js"]
