"use strict"

const fs = require('fs');
const path = require('path');
const Video = require('./video.js');

const videoFolder = path.resolve(__dirname, '../../videos');

module.exports = Playlist;

function Playlist() {
	var todos = [];
	var titleLookup = new Map();

	var videos = fs.readdirSync(videoFolder);
	videos = videos.map(name => {
		var filename = path.resolve(videoFolder, name);
		var ext = path.extname(name);
		switch (ext) {
			case '.mp4':
			case '.mov':
			break;
			case '': return false;
			default:
				console.warn('unknown file type "'+ext+'"');
				return false;
		}
		var video = new Video(filename);

		if (!video.hasThumbnail()) todos.push(video.generateThumbnail);

		titleLookup.set(video.getTitle(), video);

		return video;
	}).filter(v => v);

	run();
	function run() {
		if (todos.length <= 0) return;
		todos.pop()(run);
	}

	return {
		getVideos:videos,
		getVideo:(name) => titleLookup.get(name)
	}

}