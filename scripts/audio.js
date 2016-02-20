
// create the audio context (chrome only for now)
// create the audio context (chrome only for now)
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}
var context = new AudioContext();
var audioBuffer;
var sourceNode;
var splitter;
var analyser, analyser2;
var javascriptNode;

// get the context from the canvas to draw on
var ctx = $("#canvas").get()[0].getContext("2d");

// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw
var gradient = ctx.createLinearGradient(0,0,0,900);
gradient.addColorStop(1,'#000000');
gradient.addColorStop(0.75,'#ff0000');
gradient.addColorStop(0.25,'#ffff00');
gradient.addColorStop(0,'#ffffff');

// load the sound
setupAudioNodes();
loadSound("testing/Au5-Snowblind.mp3");

function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(context.destination);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();

    // var xhr = createCORSRequest('GET', url);

    // if (!xhr) {
    //   throw new Error('CORS not supported');
    // }

    // xhr.onload = function() {
    //     xhr.addHeader("Access-Control-Allow-Origin", "*");

    //     var responseText = xhr.responseText;
    //     console.log(responseText);
    //     // process the response.
    //     context.decodeAudioData(xhr.response, function(buffer) {
    //         playSound(buffer);
    //     });

    // };

    // xhr.onerror = function() {
    //   console.log('There was an error!');
    // };

    // xhr.send();

}

function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}

// log if an error occurs
function onError(e) {
    console.log(e);
}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function() {

    // get the average for the first channel
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    // clear the current state
    ctx.clearRect(0, 0, 900, 550);

    // set the fill style
    ctx.fillStyle=gradient;
    drawSpectrum(array);

}

function drawSpectrum(array) {
    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];

        ctx.fillRect(i*5,550-value,3,300);
        // console.log([i,value])
    }
};
// ------------------------

// var FilterSample = {
//   FREQ_MUL: 7000,
//   QUAL_MUL: 30,
//   playing: false
// };

// FilterSample.play = function() {
//   // Create the source.
//   var source = context.createBufferSource();
//   source.buffer = BUFFERS.techno;
//   // Create the filter.
//   var filter = context.createBiquadFilter();
//   //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
//   filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
//   filter.frequency.value = 5000;
//   // Connect source to filter, filter to destination.
//   source.connect(filter);
//   filter.connect(context.destination);
//   // Play!
//   if (!source.start)
//     source.start = source.noteOn;
//   source.start(0);
//   source.loop = true;
//   // Save source and filterNode for later access.
//   this.source = source;
//   this.filter = filter;
// };

// FilterSample.stop = function() {
//   if (!this.source.stop)
//     this.source.stop = source.noteOff;
//   this.source.stop(0);
//   this.source.noteOff(0);
// };

// FilterSample.toggle = function() {
//   this.playing ? this.stop() : this.play();
//   this.playing = !this.playing;
// };

// FilterSample.changeFrequency = function(element) {
//   // Clamp the frequency between the minimum value (40 Hz) and half of the
//   // sampling rate.
//   var minValue = 40;
//   var maxValue = context.sampleRate / 2;
//   // Logarithm (base 2) to compute how many octaves fall in the range.
//   var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
//   // Compute a multiplier from 0 to 1 based on an exponential scale.
//   var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
//   // Get back to the frequency value between min and max.
//   this.filter.frequency.value = maxValue * multiplier;
// };

// FilterSample.changeQuality = function(element) {
//   this.filter.Q.value = element.value * this.QUAL_MUL;
// };

// FilterSample.toggleFilter = function(element) {
//   this.source.disconnect(0);
//   this.filter.disconnect(0);
//   // Check if we want to enable the filter.
//   if (element.checked) {
//     // Connect through the filter.
//     this.source.connect(this.filter);
//     this.filter.connect(context.destination);
//   } else {
//     // Otherwise, connect directly.
//     this.source.connect(context.destination);
//   }
// };
