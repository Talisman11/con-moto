// create the audio context (chrome only for now)
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

window.onload = init;
var context = new AudioContext();

var bufferLoader;

function init() {

  bufferLoader = new BufferLoader(
    context,
    [
      '/testing/Crisis.mp3',
      '/testing/Au5-Snowblind.mp3',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

  source1.connect(context.destination);
  source2.connect(context.destination);
  // source1.start(0);
  // source2.start(0);
}


var audioBuffer;
var sourceNode;
var gainNode;
var filter;
var analyser, analyser2;
var javascriptNode;

// get the context from the canvas to draw on
var ctx = $("#canvas").get()[0].getContext("2d");
// ctx.fillStyle = "rgba(255, 255, 0, 1.0)"; //tranparent canvas, if necessary


// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw
var gradient = ctx.createLinearGradient(0,0,0,900); // (x, y), (height, width)?
gradient.addColorStop(1,'#000000'); //black
gradient.addColorStop(0.75,'#0000ff'); //blue
gradient.addColorStop(0.25,'#00ffff'); //cyan
gradient.addColorStop(0,'#00ff00'); //green

// load the sound
setupAudioNodes();
loadSound("testing/Crisis.mp3");

function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    // biquad filter
    filter = context.createBiquadFilter();
    
    // gain node
    gainNode = context.createGain();
    gainNode.gain.value = -0.0;
    console.log(gainNode.gain.value);

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
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
}
var startOffset = 0;
var startTime = 0;
function playSound() {
    startTime = context.currentTime;
    sourceNode = context.createBufferSource();
    sourceNode.buffer = global_buffer;
    sourceNode.loop = true;
    sourceNode.connect(analyser);
    sourceNode.connect(javascriptNode);
    sourceNode.connect(gainNode);

    gainNode.connect(context.destination);
    sourceNode.connect(context.destination);
    sourceNode.start(0, startOffset % global_buffer.duration);
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
    var scale = (gainNode.gain.value/2) + 1/2;
    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];

        ctx.fillRect(i*5,600-value,4,300*scale);
        // console.log([i,value])
    }
};
// ------------------------
function volume(element) { // reduction from [-1, 0]
    var volume = element.value;
    var fraction = parseInt(element.value) / parseInt(element.max);
    if (fraction < 0) {
        gainNode.gain.value = -fraction * fraction;
    } else 
        gainNode.gain.value = fraction * fraction;

    // console.log(gainNode.gain.value);

<<<<<<< HEAD
VolumeSample.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
=======
}
>>>>>>> 454e878917ebfd8c5acc0c98ca5c6f7279236d2e
