"use strict"

const child_process = require('child_process');
const dgram = require('dgram');
const config = require('../config.js');

module.exports = Player;


function Player() {

	const socket = dgram.createSocket('udp4');
	var playProcess = false;
	var nextTask = false;

	function stopVideo() {
		if (!playProcess) return;

		playProcess.removeAllListeners('exit');
		playProcess.stdout.removeAllListeners('data');
		playProcess.kill();
		playProcess = false;
	}

	function playVideo(filename) {
		if (playProcess) stopVideo();

		playProcess = child_process.spawn('ffmpeg', [
			'-loglevel','error',
			'-re',
			'-i',filename,
			'-f','rawvideo',
			'-vcodec','rawvideo',
			'-pix_fmt','rgb24',
			'-'
		])

		playProcess.stdout.on('data', sendFrame);
		playProcess.stderr.on('data', chunk => console.error(chunk.toString()));
		playProcess.on('exit', () => {
			playProcess = false;
			if (nextTask) nextTask();
		});
	}

	function sendFrame(chunk) {
		socket.send(chunk, config.matePort, config.mateHost);
	}

	return {
		stop:() => {
			console.log('stop');
			nextTask = false;
			stopVideo();
		},
		playOnce:(filename) => {
			console.log('play once "'+filename+'"');
			nextTask = false;
			playVideo(filename);
		},
		playLoop:(filename) => {
			console.log('play loop "'+filename+'"');
			nextTask = () => playVideo(filename);
			nextTask();
		}
	}
}
