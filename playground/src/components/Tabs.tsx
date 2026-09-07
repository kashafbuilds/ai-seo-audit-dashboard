import { useRef, useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: string;
};

const tabs: Tab[] = [
  {
    id: "html",
    label: "HTML",
    content: "HTML provides the structure of a web page.",
  },
  {
    id: "css",
    label: "CSS",
    content: "CSS is used to style and design web pages.",
  },
  {
    id: "javascript",
    label: "JavaScript",
    content: "JavaScript adds interactivity to web pages.",
  },
];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let newIndex = index;

    if (event.key === "ArrowRight") {
      newIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      newIndex = 0;
    } else if (event.key === "End") {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <section>
      <h2>Accessible Tabs</h2>

      <div role="tablist" aria-label="Web technologies">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          <p>{tab.content}</p>
        </div>
      ))}
    </section>
  );
}