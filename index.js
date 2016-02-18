var context = new AudioContext();

var playingKey; // Keycode of correct button to press.

// Note(wdm) Cannot call play() twice on an oscillator.

function play(freq, durationInSecs) {
  console.log('play', freq, durationInSecs);
  var oscNode = context.createOscillator();
  oscNode.frequency.value = freq;

  var gainNode = context.createGain();
  oscNode.connect(gainNode);
  gainNode.connect(context.destination);

  var nowT = context.currentTime;
  var endT = nowT + durationInSecs;
  gainNode.gain.setValueAtTime(0, nowT);
  // Note(wdm) Gain=1 results in distortion when a chord is played.
  gainNode.gain.linearRampToValueAtTime(0.3, nowT + 0.01);
  gainNode.gain.linearRampToValueAtTime(0.0, endT - 0.01);

  oscNode.start(nowT);
  oscNode.stop(endT);
}

function add(letter, label) {
  return letter.charCodeAt(0);
}

function makeButton(label, freq) {
  var b = document.createElement('button');
  b.innerText = label;
  b.onclick = function(e) { play(freq, 0.5); };
  document.body.appendChild(b);
  return b;
}

var key2note = {};
['A C4', 'S D4', 'D E4', 'F F4', 'G G4', 'H A4', 'J B4', 'K C5'].forEach(function(entry) {
  var r = entry.split(' ');
  var key = r[0].charCodeAt(0);
  var label = r[1];
  var freq = notes[label];
  var btn = makeButton(label, freq);
  key2note[key] = {freq:freq, label:label, btn:btn};
});


function onKey(e) {
  var note = key2note[e.keyCode];
  if (note) {
    if (e.type === 'keydown') {
      note.btn.click();
      var cls = (e.keyCode === Number(playingKey)) ? 'pressedOK' : 'pressedWrong';
      note.btn.classList.add(cls);
    } else {
      note.btn.className=''; // Clear all classes.
    }
  }
}

function rndNote() {
  if (document.hidden) { return; }
  var keys = Object.keys(key2note);
  playingKey= keys[Math.floor(Math.random()*keys.length)];
  play(key2note[playingKey].freq, 8);
  console.log(playingKey);
}

function quiz() {
  rndNote();
  setInterval(rndNote, 9*1000);
}

quiz();

document.addEventListener('keydown', onKey);
document.addEventListener('keyup', onKey);
