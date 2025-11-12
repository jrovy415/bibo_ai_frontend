let selectedVoice = null;

export function speakText(text) {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.4; // slightly higher = friendlier
    utterance.rate = 0.9;
    utterance.volume = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Try again in a short delay if voices not yet loaded
      setTimeout(loadVoices, 200);
      return;
    }

    // 🎵 Try to find a child-friendly voice
    selectedVoice =
      voices.find(v =>
        /Google UK English Female|Google US English Female|Microsoft Zira|Samantha|Jenny/i.test(v.name)
      ) || voices[0];

    speak();
  };

  // If voices already loaded, speak right away
  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    // Wait for voices to become available
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}
