// create the audio context (chrome only for now)
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

// window.onload = init;
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
var bass;
var lowpass;
var highpass;
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
gradient.addColorStop(0.6,'#9966ff'); //green
gradient.addColorStop(0.5,'#1a75ff'); //blue
gradient.addColorStop(0.45,'#99ffa3'); //red

// load the sound
setupAudioNodes();
// loadSound("testing/Crisis.mp3");
var sampleSong = "testing/Dereck Recay - Dream Way (Original Mix).mp3";
loadSound(sampleSong);

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
    lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    // lowpass.frequency.value = 440; // cutoff at 440hz

    highpass = context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 20000; // cutoff at 20Khz

    // bass
    bass = context.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 440; //assume < 440 needs boost
    bass.gain.value = -1;

    // gain node
    gainNode = context.createGain();

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(lowpass);
    sourceNode.connect(highpass);
    lowpass.connect(context.destination);
    highpass.connect(context.destination);

    sourceNode.connect(bass);
    bass.connect(context.destination);

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

    sourceNode.connect(lowpass);
    sourceNode.connect(highpass);
    lowpass.connect(context.destination);
    highpass.connect(context.destination);

    sourceNode.connect(bass);
    bass.connect(context.destination);

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
    if(playlist != null){
    	playlist.forEach(function(song){
            var colors = bindSliders(song);
            var high_col = colorMod($("#high")[0]); // lighten / transparency?

            high_col = colorMod($("#high")[0]); // lighten / transparency?
            vol_col = colorMod($("#vol")[0])*colors[0] + high_col*colors[0];
            bass_col = colorMod($("#bass")[0])*colors[1] + high_col*colors[1];
            low_col = colorMod($("#low")[0])*colors[2] + high_col*colors[2];

            vol_col = vol_col < 0 ? 0 : vol_col >= 255 ? 255 : vol_col | 0;
            bass_col = bass_col < 0 ? 0 : bass_col >= 255 ? 255 : bass_col | 0;
            low_col = low_col < 0 ? 0 : low_col >= 255 ? 255 : low_col | 0;

            vf = rgb(vol_col, bass_col, low_col);
            bf = rgb(bass_col, low_col, vol_col);
            lf = rgb(low_col, vol_col, bass_col);

            gradient = ctx.createLinearGradient(0,0,0,900); // (x, y), (height, width)?
            gradient.addColorStop(1,'#000000'); //black
            gradient.addColorStop(0.6, vf); //green
            gradient.addColorStop(0.5, bf); //blue
            gradient.addColorStop(0.45, lf); //red

        });
    }
    ctx.fillStyle=gradient;

    gainNode.gain.value = -1.0;
    gainNode.gain.value = 0.0;

    drawSpectrum(array);
}

function rgb(r, g, b){
  return "rgb("+r+","+g+","+b+")";
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

function colorMod(element) {
    if (element === null) {
        console.log("bad!");
        abort();
    }
    var value = element.value;
    var tint = 0;
    if (element.id === "vol") {
        return 1 + (value/200);
    } else {
        return 0.5 + (value/100);
    }
}

function volume(element) { // reduction from [-1, 0]
    var volume = element.value;
    var fraction = parseInt(element.value) / parseInt(element.max);
    if (fraction < 0) {
        gainNode.gain.value = -fraction * fraction;
    } else 
        gainNode.gain.value = fraction * fraction;

    //console.log(gainNode.gain.value);
}

function bassMod(element) {
    var val = element.value * 0.1;
    bass.gain.value = -5.0 + val;
    console.log(bass.gain.value);
}

function lowFreq(element) {
    var minValue = 440;
    var maxValue = context.sampleRate / 2;
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (element.value/100 - 1.0));
    // Get back to the frequency value between min and max.
    lowpass.frequency.value = maxValue * multiplier;
}

function highFreq(element) {
    var minValue = 12000;
    var maxValue = context.sampleRate / 2;
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (element.value/100 - 1.0));
    // Get back to the frequency value between min and max.
    highpass.frequency.value = maxValue * multiplier;
}
