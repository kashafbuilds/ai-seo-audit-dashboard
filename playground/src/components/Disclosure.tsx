import { useState } from "react";

export default function Disclosure() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <h2>Accessible Disclosure</h2>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="disclosure-content"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? "Hide Information" : "Show Information"}
      </button>

      <div
        id="disclosure-content"
        hidden={!isOpen}
      >
        <p>
          A disclosure allows users to show or hide additional information.
        </p>
      </div>
    </section>
  );
}