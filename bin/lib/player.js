"use strict"

const child_process = require('child_process');
const dgram = require('dgram');
const config = require('../config.js');

module.exports = Player;


function Player() {

	const socket = dgram.createSocket('udp4');
	var playProcess = false;
	var nextTask = false;

	function stop(cb) {
		console.log('stop');
		if (!playProcess) return cb();

		nextTask = false;
		playProcess.kill();
	}

	function play(filename) {
		console.log('play once "'+filename+'"');
		if (playProcess) throw Error();

		playProcess = child_process.spawn('ffmpeg', [
			'-loglevel','error',
			'-re',
			'-i',filename,
			'-f','rawvideo',
			'-vcodec','rawvideo',
			'-pix_fmt','rgb24',
			'-']
		)

		playProcess.stdout.on('data', sendFrame);
		playProcess.stderr.on('data', chunk => console.error(chunk.toString()));
		playProcess.on('exit', () => {
			playProcess = false;
			if (nextTask) nextTask();
		});
	}

	function playOnce(filename) {
		if (playProcess) stop();
		nextTask = false;
		play(filename);
	}

	function playLoop(filename, cb) {
		if (playProcess) stop();
		nextTask = () => play(filename);
		nextTask();
	}

	function sendFrame(chunk) {
		socket.send(chunk, config.matePort, config.mateHost);
	}

	return {
		stop:stop,
		playOnce:playOnce,
		playLoop:playLoop
	}
}
