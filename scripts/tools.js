
//user picks a song to manipulate, invoking this function
function bindSliders(song){ //might need to add more paramteres
	//lets get our data
	var danceability, energy, liveness;
	danceability = song.audio_summary.danceability;
	energy = song.audio_summary.energy;
	liveness = song.audio_summary.liveness;
	
	//map values to color
	var D, E, L; 
	D = 255 * danceability;
	E = 255 * energy;
	L = 255 * liveness;
	
	var oneG = D & 0x0000ff;
	var oneB = E & 0x00ff00;
	var oneA = L & 0xff0000;
	var colorOne = oneG + oneB +oneA;
	
	var twoG = D & 0x00ff00;
	var twoB = E & 0xff0000;
	var twoA= L & 0x0000ff;
	var colorTwo = twoG + twoB + twoA;

	var threeG = D & 0xff0000;
	var threeB = E & 0x0000ff;
	var threeA = L & 0x00ff00;
	var colorThree = threeG + threeB + threeA;
	return [colorOne,colorTwo,colorThree];
}

function getSpotifyPlayer(inPlaylist, callback) {
    var curSong = 0;
    var audio = null;
    var player = createPlayer();
    var PL = null;

    function addSpotifyInfoToPlaylist() {
        var tids = [];
        inPlaylist.forEach(function(song) {
            var tid = fidToSpid(song.tracks[0].foreign_id);
            tids.push(tid);
        });
//	debugger;
	$.ajax({
		url:"https://api.spotifycom/v1/tracks/",
		type:"GET",
		dataType:"json",
		crossDomain: true,
		data: {'ids': tids.join(',')},
		success: function(data) {
			console.log('sptracks',tids,data);
			data.tracks.forEach(function(track,i) {
				inPlaylist[i].spotifyTrackInfo = track;
			});
	
			console.log('inPlaylist', inPlaylist);
			PL = filterSongs(inPlaylist);
			showCurSong(false);
			callback(player);
		},
		error: function(err, res) {
			console.log(err);
		}
	});
/*	$.getJSON("https://api.spotify.com/v1/tracks/", {'ids': tids.join(',')}) 
            .done(function(data) {
                console.log('sptracks', tids, data);
                data.tracks.forEach(function(track, i) {
                    inPlaylist[i].spotifyTrackInfo = track;
                });

                console.log('inPlaylist', inPlaylist);
                playlist = filterSongs(inPlaylist);
                showCurSong(false);
                callback(player);
            })
            .error( function() {
                info("Whoops, had some trouble getting that playlist");
            }) ;
    }*/
}
    function filterSongs(songs) {
        var out = [];

        function isGoodSong(song) {
            return song.spotifyTrackInfo.preview_url != null;
        }

        songs.forEach(function(song) {
            if (isGoodSong(song)) {
                out.push(song);
            }
        });

        return out;
    }

    function showSong(song, autoplay) {
        $(player).find(".sp-album-art").attr('src', getBestImage(song.spotifyTrackInfo.album.images, 300).url);
        $(player).find(".sp-title").text(song.title);
        $(player).find(".sp-artist").text(song.artist_name);
        audio.attr('src', song.spotifyTrackInfo.preview_url);
        if (autoplay) { 
            audio.get(0).play();
        }
    }


    function getBestImage(images, maxWidth) {
        var best = images[0];
        images.reverse().forEach(
            function(image) {
                if (image.width <= maxWidth) {
                    best = image;
                }
            }
        );
        return best;
    }

    function showCurSong(autoplay) {
        showSong(playlist[curSong], autoplay);
    }

    function nextSong() {
        if (curSong < playlist.length - 1) {
            curSong++;
            showCurSong(true);
        } else {
        }
    }

    function prevSong() {
        if (curSong > 0) {
            curSong--;
            showCurSong(true);
        }
    }

    function togglePausePlay() {
        console.log('tpp', audio.get(0).paused);
        if (audio.get(0).paused) {
            audio.get(0).play();
        } else {
            audio.get(0).pause();
        }
    }

    function createPlayer() {
        var main = $("<div class='sp-player'>");
        var img = $("<img class='sp-album-art'>");
        var info  = $("<div class='sp-info'>");
        var title = $("<div class='sp-title'>");
        var artist = $("<div class='sp-artist'>");
        var controls = $("<div class='btn-group sp-controls'>");

        var next = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-forward"></span></button>');
        var prev = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-backward"></span></button>');
        var pausePlay = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-play"></span></button>');


        audio = $("<audio>");
        audio.on('pause', function() {
            var pp = pausePlay.find("span");
            pp.removeClass('glyphicon-pause');
            pp.addClass('glyphicon-play');
        });

        audio.on('play', function() {
            var pp = pausePlay.find("span");
            pp.addClass('glyphicon-pause');
            pp.removeClass('glyphicon-play');
        });

        audio.on('ended', function() {
            console.log('ended');
            nextSong();
        });

        next.on('click', function() {
            nextSong();
        });

        pausePlay.on('click', function() {
            togglePausePlay();
        });

        prev.on('click', function() {
            prevSong();
        });


        info.append(title);
        info.append(artist);

        controls.append(prev);
        controls.append(pausePlay);
        controls.append(next);

        main.append(img);
        main.append(info);
        main.append(controls);
    
        main.bind('destroyed', function() {
            console.log('player destroyed');
            audio.pause();
        });
        return main;
    }

    addSpotifyInfoToPlaylist();
    return player;
}

// set up a handler so if an element is destroyed,
// the 'destroyed' handler is invoked.
// See // http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom

(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery);
