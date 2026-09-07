import { useState } from "react";
import Modal from "./components/Modal";
import Tabs from "./components/Tabs";
import Disclosure from "./components/Disclosure";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main>
      <h1>Accessible Components Playground</h1>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        Open Modal
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>
          This is an accessible modal dialog built with React and TypeScript.
        </p>
      </Modal>

      <Tabs />

      <Disclosure />
    </main>
  );
}

export default App;