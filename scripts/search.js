function showResponse(response) {
	var responseString = JSON.stringify(response, '', 2);
	document.getElementById('response').innerHTML+=responseString;
}

function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
	gapi.client.setApiKey('AIzaSyDP2Ia9uuC18HBIs8MloJe6fzMKNs5UtNg');
	search();
}

function search(){
	var request = gapi.client.youtube.playlist.list({
		part: 'snippet'
	});
	request.execute(onSearchResponse);
}

function onSearchResponse(response){
	showResponse(response);
}
