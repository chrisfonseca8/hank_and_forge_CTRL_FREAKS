// src/utils/speech.js
// Browser Text-to-Speech utilities using the Web Speech API.
// No external APIs or paid services — uses SpeechSynthesisUtterance only.

/**
 * Speak a text string aloud.
 * Cancels any in-progress speech first so messages never overlap.
 *
 * @param {string}   text        The text to speak
 * @param {object}   [options]
 * @param {string}   [options.lang="en-US"]
 * @param {number}   [options.rate=0.95]   - 0.1 to 10, 1 is normal speed
 * @param {number}   [options.pitch=1]     - 0 to 2, 1 is normal pitch
 * @param {Function} [options.onStart]     - called when speech begins
 * @param {Function} [options.onEnd]       - called when speech finishes
 * @param {Function} [options.onError]     - called on speech error
 */
export const speak = (text, options = {}) => {
  if (!text || !text.trim()) return;
  if (!window.speechSynthesis) {
    console.warn("[speech] SpeechSynthesis not supported in this browser.");
    return;
  }

  // Cancel anything currently speaking before starting new speech
  window.speechSynthesis.cancel();

  const {
    lang    = "en-US",
    rate    = 0.95,
    pitch   = 1,
    onStart = null,
    onEnd   = null,
    onError = null,
  } = options;

  const utterance      = new SpeechSynthesisUtterance(text);
  utterance.lang       = lang;
  utterance.rate       = rate;
  utterance.pitch      = pitch;

  if (onStart) utterance.onstart = onStart;
  if (onEnd)   utterance.onend   = onEnd;
  if (onError) utterance.onerror = (e) => {
    // "interrupted" fires when cancel() is called — not a real error
    if (e.error !== "interrupted") onError(e);
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Immediately stop any ongoing speech.
 */
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Returns true if the browser supports SpeechSynthesis.
 */
export const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;
