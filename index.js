var context = new AudioContext();

var ATTEMPT_DURATION = 4; // How long each target note lasts.
var currentAttempt; // The game state.

// Note(wdm) Cannot call play() twice on an oscillator.

function play(note, durationInSecs, onended) {
  console.log('play', note, durationInSecs);

  var oscNode = context.createOscillator();
  oscNode.frequency.value = note.freq;
  oscNode.onended = onended;

  var gainNode = context.createGain();
  oscNode.connect(gainNode);
  gainNode.connect(context.destination);

  var nowT = context.currentTime;
  var endT = nowT + durationInSecs;
  gainNode.gain.setValueAtTime(0, nowT);
  // Note(wdm) Gain=1 results in distortion when a chord is played.
  gainNode.gain.exponentialRampToValueAtTime(0.30, nowT + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, endT - 0.01);

  oscNode.start(nowT);
  oscNode.stop(endT);

  // Cancel func.
  return function() {
    var nowT = context.currentTime;
    var endT = nowT + 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.01, endT);
    oscNode.stop(endT);
  };
}

function add(letter, label) {
  return letter.charCodeAt(0);
}

function makeButton(label, freq) {
  var b = document.createElement('button');
  b.innerText = label;
  b.classList.add('key');
  document.getElementById('keyboard').appendChild(b);
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

function addLog(cls) {
  var d = document.createElement('span');
  d.className = cls;
  document.getElementById('log').appendChild(d);
}

function handleNote(note, isDown) {
  if (isDown) {
    var correct = (note === currentAttempt.correctNote);
    var cls = (correct) ? 'pass' : 'fail';
    // Only update the attempt and the progress bar once.
    if (!currentAttempt.answer) {
      document.getElementById('next').disabled = false;
      currentAttempt.answer = note;
      addLog(cls);
      currentAttempt.correctNote.btn.classList.add('correct');
    }
    note.btn.classList.add(cls);
    play(note, 1);
  } else {
    note.btn.classList.remove('pass','fail');
  }
}

function onKey(e) {
  if (e.type === 'keydown') {
    if (e.keyCode === 32) { // Spacebar
      document.getElementById('repeat').click();
      stopEvt(e);
      return;
    }
    if (e.keyCode === 13) { // Return
      document.getElementById('next').click();
      stopEvt(e);
      return;
    }
  }

  var note = key2note[e.keyCode];
  if (note) {
    handleNote(note, e.type === 'keydown');
    stopEvt(e);
  }
}

function playCorrectNote() {
  if (currentAttempt.stopNote) {
    currentAttempt.stopNote();
  }
  var stop = play(currentAttempt.correctNote, ATTEMPT_DURATION);
  currentAttempt.stopNote = stop;
}

function newAttempt() {
  document.getElementById('next').disabled = true;
  if (currentAttempt) {
    currentAttempt.correctNote.btn.classList.remove('correct');
  }
  var keys = Object.keys(key2note);
  var key = keys[Math.floor(Math.random()*keys.length)];
  var note = key2note[key];
  currentAttempt = {
    correctNote :note,
    answer: null,
  };
  playCorrectNote();
}

function stopEvt(e) {
  e.preventDefault();
  e.stopPropagation();
}

function onMouse(e) {
  if (!e.target.classList.contains('key')) {
    return;
  }
  stopEvt(e);
  var label = e.target.innerText;
  var note = label2note[label];
  handleNote(note, e.type === 'mousedown' || e.type === 'touchstart');
}

function onNext() {
  newAttempt();
}

function onRepeat() {
  playCorrectNote();
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

document.getElementById('next').addEventListener('click', onNext);
document.getElementById('repeat').addEventListener('click', onRepeat);

newAttempt();
