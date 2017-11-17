#!/bin/bash

echo "streaming '$1' to matelight. quit with ctrl-c."
while [ 1 ]
do
	ffmpeg -loglevel error -re -i $1 -f rawvideo -vcodec rawvideo -pix_fmt rgb24 - > /dev/udp/${CRAP_HOST}/1337
	test $? -eq 255 && break
done
