"use strict"

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

var thumbFolder = path.resolve(__dirname, '../../web/assets/thumbs');

function Video(filename, player) {
	var me = this;

	var name = path.basename(filename);
	var title = name.replace(/\..*$/, '');
	var slug = title.replace(/[^a-z0-9]+/gi, '_');
	var thumbnailName = slug+'.jpg';
	var thumbnailFilename = path.resolve(thumbFolder, thumbnailName);

	var hasThumbnail = fs.existsSync(thumbnailFilename);

	me.hasThumbnail = () => hasThumbnail;
	me.getThumbnailName = () => thumbnailName;
	me.getTitle = () => title;

	me.toJSON = () => ({
		hasThumbnail: hasThumbnail,
		thumbnailName: thumbnailName,
		title: title
	})

	me.play = cb =>
		player.stop(() =>
			player.play(filename, () => cb())
		)
	
	me.generateThumbnail = cb =>
		getFrameCount(filename, n =>
			generateStrip(filename, thumbnailFilename, Math.floor(n/8), () => {
				hasThumbnail = true;
				cb()
			})
		)
	return me;
}



module.exports = Video;

function getFrameCount(filename, cb) {
	console.log('counting frames from "'+filename+'"');
	var result = '';
	var p = child_process.spawn('ffprobe', [
		'-v','error',
		'-count_frames',
		'-select_streams','v:0',
		'-show_entries','stream=nb_read_frames',
		'-of','default=nokey=1:noprint_wrappers=1',
		filename
	])
	p.stdout.on('data', chunk => result += chunk.toString());
	p.stderr.on('data', chunk => console.error(chunk.toString()));
	p.on('exit', () => cb(parseFloat(result)));
}

function generateStrip(filename, thumbfile, everyFrame, cb) {
	console.log('generating thumbnails for "'+filename+'"');
	var min = Math.max(0, Math.round(everyFrame/2-12));
	var max = min + 23;
	var p = child_process.spawn('ffmpeg', [
		'-loglevel','error',
		'-y',
		'-i',filename,
		'-frames','1',
		'-q:v','2',
		'-vf','select=between(mod(n\\,'+everyFrame+')\\,'+min+'\\,'+max+')*not(mod(n\\,2)),scale=40:16,tile=1x96',
		thumbfile
	])
	p.stderr.on('data', chunk => console.error(chunk.toString()));
	p.on('exit', () => cb());
}
