"use strict"

const fs = require('fs');
const path = require('path');
const express = require('express');
const playlist = require('./lib/playlist.js')();

const app = express();

app.use('/', express.static(path.resolve(__dirname, '../web')));
app.get('/api/getvideos', (req, res) => {
	res.status(200).json(playlist.getVideos.map(v => v.toJSON()));
})

app.get('/api/playvideo/:name', (req, res) => {
	playlist.getVideo(req.params.name).play(result => {
		res.status(200).json(result);
	})
})

app.listen(8080, function (err) {
	if (err) throw err;
	console.log('Server started on port 8080');
})