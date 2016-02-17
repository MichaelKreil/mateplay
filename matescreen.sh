#!/bin/bash

echo "streaming screen to matelight. quit with ctrl-c."
case $(uname) in
Darwin)
   ffmpeg -loglevel fatal -re -f avfoundation -r 25 -i "1" -vf "crop=1200:480, scale=40:16, eq=1.5" -f rawvideo -vcodec rawvideo -sws_flags bilinear -pix_fmt rgb24 - > /dev/udp/matelight.cbrp3.c-base.org/1337;;
Linux)
   ffmpeg -loglevel fatal -re -video_size 600x240 -f x11grab -r 25 -i :0.0+100,200 -vf "scale=40:16, eq=1.5" -f rawvideo -vcodec rawvideo -sws_flags bilinear -pix_fmt rgb24 - > /dev/udp/matelight.cbrp3.c-base.org/1337;;
esac