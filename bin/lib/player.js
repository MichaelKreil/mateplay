"use strict"

const child_process = require('child_process');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

module.exports = Player;

function Player() {
	var playProcess = false;

	function stop(cb) {
		console.log('stop');
		if (!playProcess) return cb();

		playProcess.on('exit', () => {
			playProcess = false;
			cb();
		});
		playProcess.kill();
	}

	function play(filename, cb) {
		console.log('play "'+filename+'"');
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

		//'>','/dev/udp/matelight.cbrp3.c-base.org/1337'
		playProcess.stdout.on('data', chunk => {
			socket.send(chunk, 1337, 'matelight.cbrp3.c-base.org');
			//console.log(chunk.toString())
		});
		playProcess.stderr.on('data', chunk => console.error(chunk.toString()));
		cb();
	}

	function sendFrame(chunk) {
		socket.send(chunk, config.matePort, config.mateHost);
	}

	return {
		stop:stop,
		play:play
	}
}
