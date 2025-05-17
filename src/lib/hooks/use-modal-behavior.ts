import { RefObject, useEffect } from "react";

export function useModalBehavior(
  isVisible: boolean,
  modalRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isVisible) return;

    document.documentElement.classList.add("prevent-scrollbar-shift");
    document.body.style.overflow = "hidden";

    const scrollPos = window.scrollY;
    const preventScrollJump = () => {
      if (window.scrollY !== scrollPos) {
        window.scrollTo(0, scrollPos);
      }
    };
    preventScrollJump();
    setTimeout(preventScrollJump, 50);
    setTimeout(preventScrollJump, 150);

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;

    const focusableEls = Array.from(
      modal.querySelectorAll<HTMLElement>(focusableSelectors),
    );
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !modal) return;
      if (!focusableEls.length) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    }

    modal.addEventListener("keydown", handleTab);
    document.addEventListener("keydown", handleEscape); // Listen on document for Escape to prevent choice

    return () => {
      document.documentElement.classList.remove("prevent-scrollbar-shift");
      document.body.style.overflow = "";
      modal.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, modalRef]);
}
