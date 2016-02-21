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
// ctx.fillStyle = "rgba(255, 255, 0, 1.0)"; //tranparent canvas, if necessary


// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw
var gradient = ctx.createLinearGradient(0,0,0,900);
gradient.addColorStop(1,'#000000');
gradient.addColorStop(0.75,'#0000ff');
gradient.addColorStop(0.25,'#00ffff');
gradient.addColorStop(0,'#00ff00');

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
var global_buffer;
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            global_buffer = buffer;
            sourceNode.buffer = buffer;
            playSound();
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
var startOffset = 0;
var startTime = 0;
// DO NOT TOUCH THIS METHOD
var first = false;
function playSound() {
    startTime = context.currentTime;
    if (first) {

        sourceNode.loop = true;
        sourceNode.connect(analyser);
        analyser.connect(javascriptNode);

        sourceNode.connect(context.destination);
        // Start playback, but make sure we stay in bound of the buffer.
        sourceNode.start(0, startOffset % global_buffer.duration);
    } else {
        sourceNode = context.createBufferSource();
        sourceNode.buffer = global_buffer;
        sourceNode.loop = true;
        sourceNode.connect(analyser);
        analyser.connect(javascriptNode);

        sourceNode.connect(context.destination);
        // Start playback, but make sure we stay in bound of the buffer.
        sourceNode.start(0, startOffset % global_buffer.duration);
    }
}

function pauseSound() {
    sourceNode.stop();
    // Measure how much time passed since the last pause.
    startOffset += context.currentTime - startTime;
}

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
    ctx.clearRect(0, 0, 928, 550);

    // set the fill style
    ctx.fillStyle=gradient;
    drawSpectrum(array);

}

function drawSpectrum(array) {
    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];

        ctx.fillRect(i*5,550-value,4,550);
        // console.log([i,value])
    }
};
// ------------------------

function showValue(newValue)
{
    this.innerHTML=newValue;
}


var VolumeSample = {
};

// Gain node needs to be mutated by volume control.
VolumeSample.gainNode = null;

VolumeSample.play = function() {
  if (!context.createGain)
    context.createGain = context.createGainNode;
  this.gainNode = context.createGain();
  var source = context.createBufferSource();
  source.buffer = BUFFERS.techno;

  // Connect source to a gain node
  source.connect(this.gainNode);
  // Connect gain node to destination
  this.gainNode.connect(context.destination);
  // Start playback in a loop
  source.loop = true;
  if (!source.start)
    source.start = source.noteOn;
  source.start(0);
  this.source = source;
};

VolumeSample.changeVolume = function(element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  // Let's use an x*x curve (x-squared) since simple linear (x) does not
  // sound as good.
  this.gainNode.gain.value = fraction * fraction;
};

VolumeSample.stop = function() {
  if (!this.source.stop)
    this.source.stop = source.noteOff;
  this.source.stop(0);
};

VolumeSample.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
