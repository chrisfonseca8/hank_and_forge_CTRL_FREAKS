// src/components/AnswerBox.jsx

import { useRef, useState } from "react";

export default function AnswerBox({ answer, onChange, onSubmit, loading }) {
  const charLen  = answer.length;
  const canSubmit = charLen > 0 && !loading;

  const recognitionRef    = useRef(null);  // SpeechRecognition instance
  const baseTextRef       = useRef("");    // text that was in the box when mic started
  const finalTranscriptRef = useRef("");  // accumulates all isFinal speech segments

  const [listening, setListening] = useState(false);

  // ── Build or retrieve the recognition instance ──────────────
  const getRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition         = new SpeechRecognition();
    recognition.continuous    = true;   // keep listening until explicitly stopped
    recognition.interimResults = true;  // show words as they are spoken
    recognition.lang          = "en-US";

    // ── onresult: fired on every new word or phrase ────────────
    // BUG FIX 1 & 2: separate isFinal from interim, and preserve
    // existing text (baseTextRef) so speech appends rather than replaces.
    recognition.onresult = (event) => {
      let interimTranscript = "";

      // Only process results from the latest batch (event.resultIndex onwards)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Confirmed words — add a space and lock them in
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          // Interim (still being spoken) — shown but not locked in
          interimTranscript += result[0].transcript;
        }
      }

      // Combine: text before mic started + confirmed speech + live interim
      onChange(
        baseTextRef.current +
        finalTranscriptRef.current +
        interimTranscript
      );
    };

    // ── onend: BUG FIX 3 — reset button when recognition auto-stops ──
    // Fires on silence timeout or after .stop() is called.
    recognition.onend = () => {
      setListening(false);
      // Commit: strip trailing interim — keep only the confirmed final text
      onChange(baseTextRef.current + finalTranscriptRef.current.trimEnd());
    };

    // ── onerror: BUG FIX 4 — always reset state on error ─────
    recognition.onerror = (event) => {
      console.error("[SpeechRecognition] error:", event.error);
      setListening(false);

      if (event.error === "not-allowed") {
        alert("Microphone access was denied. Please allow microphone access in your browser settings.");
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // ── Toggle mic on / off ──────────────────────────────────────
  const toggleMic = () => {
    const recognition = getRecognition();

    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (!listening) {
      // Snapshot current answer as the base — speech will APPEND to this
      baseTextRef.current       = answer;
      finalTranscriptRef.current = "";
      recognition.start();
      setListening(true);
    } else {
      recognition.stop(); // triggers onend which resets listening state
    }
  };

  // ────────────────────────────────────────────────────────────
  return (
    <div className="answer-card">
      <textarea
        className="answer-textarea"
        placeholder="Type your answer here…"
        maxLength={4000}
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />

      <div className="answer-actions">
        <span className="char-count">{charLen} / 4000</span>

        <div className="answer-btns">
          {/* Mic button */}
          <button
            type="button"
            className={`btn-mic ${listening ? "btn-mic--active" : ""}`}
            onClick={toggleMic}
            disabled={loading}
            title={listening ? "Stop recording" : "Start voice input"}
          >
            {listening ? (
              <>
                <span className="mic-pulse" />
                Stop
              </>
            ) : (
              <>🎤 Speak</>
            )}
          </button>

          {/* Submit button */}
          <button
            className="btn-submit"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Scoring…
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}