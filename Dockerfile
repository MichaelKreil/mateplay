FROM node:carbon-alpine
RUN apk add --update ffmpeg
WORKDIR /mateplay
COPY . .
RUN npm install
CMD [ "node", "bin/server.js" ]
