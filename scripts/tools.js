
  function getConfig(){
	return {
		apiKey: "KQOXQN3XYFH2F1T96",
		spotifySpace: "spotify"
		echoNestHost: "http://developer.echonest.com/"
	};
  }


  function playListButton(title, playlist){
	var link = '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:TITLE:TRACKS" style="width:350px; height:250px;" frameborder="0"></iframe>';
	var ids = [];
	playlist.forEach(function(song) {
		var split = song.split[0].foreign_id(':');
		ids.push(split[split.length-1]);
	});
	var tracks = ids.join(',');
	var embed = link.replace('TRACKS',tracks);
	embed = embed.replace('TITLE',title);
	var li = $("<span>").html(embed);
	return $("<span>").html(embed);
}
