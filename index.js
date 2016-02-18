var context = new AudioContext();

var playingNote; // Keycode of correct button to press.

// Note(wdm) Cannot call play() twice on an oscillator.

function play(note, durationInSecs) {
  console.log('play', note, durationInSecs);
  var oscNode = context.createOscillator();
  oscNode.frequency.value = note.freq;

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
  document.body.appendChild(b);
  return b;
}

var key2note = {};
var label2note = {};
['A C5', 'S D5', 'D E5', 'F F5', 'G G5', 'H A5', 'J B5', 'K C6'].forEach(function(entry) {
  var r = entry.split(' ');
  var key = r[0].charCodeAt(0);
  var label = r[1];
  var freq = notes[label];
  var btn = makeButton(label, freq);
  var note = {freq:freq, label:label, btn:btn};
  key2note[key] = note;
  label2note[label] = note;
});

function handleNote(note, isDown) {
  if (isDown) {
    var cls = (note === playingNote) ? 'pressedOK' : 'pressedWrong';
    note.btn.classList.add(cls);
    play(note, 0.5);
  } else {
    note.btn.className=''; // Clear all classes.
  }
}

function onKey(e) {
  var note = key2note[e.keyCode];
  if (note) {
    handleNote(note, e.type === 'keydown');
  }
}

function rndNote() {
  if (document.hidden) { return; }
  var keys = Object.keys(key2note);
  var key = keys[Math.floor(Math.random()*keys.length)];
  playingNote = key2note[key];
  play(playingNote, 8);
  console.log(playingNote);
}

function quiz() {
  rndNote();
  setInterval(rndNote, 9*1000);
}

quiz();

function stopEvt(e) {
  e.preventDefault();
  e.stopPropagation();
}

function onMouse(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  stopEvt(e);
  var label = e.target.innerText;
  var note = label2note[label];
  handleNote(note, e.type === 'mousedown' || e.type === 'touchstart');
}

document.addEventListener('keydown', onKey);
document.addEventListener('keyup', onKey);
if (navigator.maxTouchPoints) {
  document.addEventListener('touchstart', onMouse);
  document.addEventListener('touchend', onMouse);
} else  {
  document.addEventListener('mousedown', onMouse);
  document.addEventListener('mouseup', onMouse);
}
