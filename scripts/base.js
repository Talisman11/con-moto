jQuery.ajaxSettings.traditional = true;
function getConfig(){
	return {
		apiKey: "KQOXQN3XYFH2F1T96",
		spotifySpace: "spotify",
		echoNestHost: "http://developer.echonest.com/",
	};
}

var config = getConfig();
var playlist, currSong;
var accessed = false;
function getArtist(input, wandering, variety){
	var url = config.echoNestHost + 'api/v4/playlist/static';
	$("#results").empty();
	console.log("searching...");
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		crossDomain: true,
		data: {'artist': input,
 			'api_key': config.apiKey,
 			'bucket': ['id:' + config.spotifySpace, 'audio_summary'], 'limit':true, 'variety':1, 'results':10, type:'artist-radio', },
		success: function(data){
			if(!(data.response.hasOwnProperty("songs"))){
                           	console.log("whoopsies");
			} else {
				console.log("got the data for manipulation");
			//	console.log(data.response.songs);
				playlist = data.response.songs;
				playlist.forEach(function(song){
					$("#results").append(String(song.title)+'\n');
				});
				accessed = true;
			//	console.log(accessed);
			}
		},
		error: function(err, res){
			console.log(err);
		}
	});
}		

function curate(input, wandering, variety){
	var url = config.echoNestHost + 'api/v4/playlist/static';
	$("#results").empty();
	console.log("curating...");
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		crossDomain: true,
		data: {'artist':input,
			'api_key': config.apiKey,
			'bucket': ['id:' + config.spotifySpace, 'tracks'], 'limit':true, 'variety':1, 'results':10, type:'artist-radio',},
		success: function(data){
			if(!(data.response.hasOwnProperty("songs"))){
				console.log("wrong type perhaps?");
			} else {
				console.log("Time to construct the player");
				var title = "Results for " + input;
				var spotifyPlayButton = playListButton(title, data.response.songs);
			}
		},
		error: function(err, res){
			console.log(err);
		}
	});
}
		
function newSearch(){
	var artist = $("#artist").val();
	getArtist(artist,false,.2);
	curate(artist,false,.2);
}

function find(){
	$("#artist").on('keydown',function(evt) {
		if(evt.keyCode == 13) {
			newSearch();
		}
	});
	$("#find").on("click", function() {
		newSearch();
	});
}

$(document).ready(function() {
	find();
});

