$(function () {
	var videos = [], activeVideo, inAppMode;

	checkState();

	$(window).resize(checkState);
	function checkState () {
		inAppMode = window.innerWidth < 700;
		checkHover();
	}

	$(window).scroll(checkHover);

	$('#stopButton').click(function () {
		$.getJSON('/api/stop', function () {})
	})

	$.getJSON('/api/getvideos', function (data) {
		videos = data;
		console.log(videos);
		var container = $('#videos');
		container.html(null);
		videos.forEach(function (video) {
			var node = $([
				'<div class="video">',
					'<div class="preview" style="background-image:url(\'/assets/thumbs/'+video.thumbnailName+'\')">',
						'<div class="playButton"></div>',
					'</div>',
					'<div class="title">'+video.title+'</div>',
				'</div>'
			].join(''));

			container.append(node);

			node.on('mouseover', function () { checkHover(video) });
			node.on('mouseout',  function () { checkHover(false) });

			node.on('click', function () {
				play(video);
			})

			video.node = node;
			video.preview = node.find('.preview');
			video.offset = 0;

			node.find('.playButton').get(0).insertAdjacentHTML('beforeend','<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#000" stroke-width="15" stroke="#fff"/><polygon points="70,55 70,145 145,100" fill="#fff"/></svg>');
		})
		checkHover();
	})

	function checkHover(video) {
		if (inAppMode) {
			var y0 = $(window).scrollTop() + window.innerHeight/2;
			var minDistance = 1e10;
			
			videos.forEach(function (video) {
				var y = video.preview.offset().top + video.preview.height()/2;
				var distance = Math.abs(y - y0);
				if (minDistance > distance) {
					minDistance = distance;
					activeVideo = video;
				}
			})
		} else {
			activeVideo = video;
		}
			
		videos.forEach(function (video) {
			if (video === activeVideo) {
				video.node.toggleClass('active', true);
			} else {
				video.offset = 0;
				video.preview.css('background-position', '0 '+(-48*128-1)+'px');
				video.node.toggleClass('active', false);
			}
		})
	}

	setInterval(function () {
		if (!activeVideo) return;
		activeVideo.offset = (activeVideo.offset+1) % 96;
		activeVideo.preview.css('background-position', '0 '+(-activeVideo.offset*128-1)+'px');
	}, 80)

	function play(video) {
		$.getJSON('/api/play/'+video.title, function (response) {
			console.log(response);
		})
	}
})