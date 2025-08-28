let lastSpeakTime = 0;

export function speakText(text, { lang = 'en-US', rate = 1, pitch = 1, onBoundary = null, onEnd = null } = {}) {
  if (!text) return;

  const now = Date.now();
  if (now - lastSpeakTime < 1200) {
    // Cooldown of 1.2 seconds not passed yet
    return;
  }
  lastSpeakTime = now;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === lang) || voices[0];
  if (voice) utterance.voice = voice;

  if (onBoundary && typeof onBoundary === 'function') {
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        onBoundary(event.charIndex);
      }
    };
  }

  if (onEnd && typeof onEnd === 'function') {
    utterance.onend = () => {
      onEnd();
    };
  }

  window.speechSynthesis.speak(utterance);
}
