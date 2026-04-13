let selectedVoice = null;
let voicesLoaded = false;

/**
 * Scores a voice on how "Ms. Rachel-like" it sounds.
 * Higher = better match.
 */
function scoreMsRachelVoice(voice) {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  // Must be English
  if (!lang.startsWith('en')) return -1;

  // Top-tier: warm US female voices closest to her style
  if (/google us english/i.test(name))          score += 10;
  if (/samantha/i.test(name))                   score += 9;  // macOS — very warm
  if (/jenny/i.test(name))                      score += 8;  // Microsoft — gentle
  if (/aria/i.test(name))                       score += 8;  // Microsoft Natural
  if (/zira/i.test(name))                       score += 7;  // Microsoft
  if (/google uk english female/i.test(name))   score += 6;

  // Prefer US English over UK/AU
  if (lang === 'en-us') score += 3;
  if (lang === 'en-gb')  score += 1;

  // Deprioritize robotic-sounding voices
  if (/android|espeak|festival/i.test(name)) score -= 5;

  return score;
}

/**
 * cancelSpeech()
 * Immediately stops any ongoing speech synthesis.
 */
export function cancelSpeech() {
  window.speechSynthesis.cancel();
}

/**
 * speakText(text, options)
 *
 * options: {
 *   rate        : number   (default 0.78)
 *   pitch       : number   (default 1.25)
 *   volume      : number   (default 1.0)
 *   onBoundary  : (wordIndex: number) => void
 *   onEnd       : () => void
 *   onStart     : () => void
 * }
 */
export function speakText(text, options = {}) {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    options.onEnd?.();
    return;
  }

  const {
    rate       = 0.78,
    pitch      = 1.25,
    volume     = 1.0,
    onBoundary = null,
    onEnd      = null,
    onStart    = null,
  } = options;

  // Pre-compute word start positions for boundary mapping
  const words = text.split(' ');
  const wordStartPositions = [];
  let pos = 0;
  for (const word of words) {
    wordStartPositions.push(pos);
    pos += word.length + 1;
  }

  const doSpeak = () => {
    window.speechSynthesis.cancel();

    const utterance   = new SpeechSynthesisUtterance(text);
    utterance.pitch   = pitch;
    utterance.rate    = rate;
    utterance.volume  = volume;

    if (selectedVoice) utterance.voice = selectedVoice;

    if (onStart) utterance.onstart = () => onStart();
    utterance.onend   = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    if (onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name !== 'word') return;
        const charIndex = event.charIndex;
        let wordIndex = 0;
        for (let i = 0; i < wordStartPositions.length; i++) {
          if (charIndex >= wordStartPositions[i]) wordIndex = i;
          else break;
        }
        onBoundary(wordIndex);
      };
    }

    window.speechSynthesis.speak(utterance);
  };

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      setTimeout(loadVoices, 200);
      return;
    }

    // Only score and select once — cached for all subsequent calls
    if (!voicesLoaded) {
      let bestVoice = null;
      let bestScore = -Infinity;
      for (const voice of voices) {
        const score = scoreMsRachelVoice(voice);
        if (score > bestScore) {
          bestScore = score;
          bestVoice = voice;
        }
      }
      selectedVoice = bestVoice || voices[0];
      voicesLoaded = true;
    }

    doSpeak();
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}