FROM node:carbon-alpine
RUN apk add --update ffmpeg bash vim
WORKDIR /mateplay
COPY . .
RUN npm install
EXPOSE 8080
CMD [ "node", "bin/server.js" ]
