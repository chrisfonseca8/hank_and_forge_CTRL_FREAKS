// src/hooks/useTabWarning.js
//
// Detects tab switches using the Page Visibility API (visibilitychange).
// This is the correct event to use — it fires when the browser tab becomes
// hidden, whether the user switches tabs, minimises the window, or opens
// a new window on top. The `blur` event fires too eagerly (e.g. clicking
// the address bar) and produces false positives.
//
// Behaviour:
//   1st tab switch  → showWarning = true, violations = 1  (user sees modal, can continue)
//   2nd tab switch  → showWarning = true, violations = 2  (modal shows, then forced withdrawal)
//
// The hook is active only while the interview is in progress (active = true).

import { useState, useRef, useEffect, useCallback } from "react";

const MAX_VIOLATIONS = 2;

/**
 * @param {object}   options
 * @param {boolean}  options.active       - Whether to listen (false during feedback/loading)
 * @param {Function} options.onForceEnd   - Called when violations reach MAX_VIOLATIONS
 *                                          and the user acknowledges the final modal
 */
export const useTabWarning = ({ active, onForceEnd }) => {
  const [violations,   setViolations]   = useState(0);
  const [showWarning,  setShowWarning]  = useState(false);

  // Use a ref for the live count — avoids stale closure issues inside the
  // event listener while keeping the state in sync for the UI.
  const violationsRef = useRef(0);

  // ── Visibility change handler ──────────────────────────────
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      // Only count when the tab becomes hidden (user left), not when they return
      if (document.visibilityState !== "hidden") return;

      const newCount = violationsRef.current + 1;
      violationsRef.current = newCount;
      setViolations(newCount);
      setShowWarning(true);     // always show modal on every violation
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]);

  // ── User clicks "I Understand" on the warning modal ───────
  // If they've used up all violations, this triggers the forced end.
  const acknowledgeWarning = useCallback(() => {
    setShowWarning(false);

    if (violationsRef.current >= MAX_VIOLATIONS) {
      // Short delay so the modal can close visibly before navigating away
      setTimeout(() => onForceEnd(), 300);
    }
  }, [onForceEnd]);

  return {
    violations,          // current violation count (1 or 2)
    maxViolations: MAX_VIOLATIONS,
    showWarning,         // whether to render the modal
    acknowledgeWarning,  // call when user clicks the modal button
  };
};