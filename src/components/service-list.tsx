"use client";

import { Plus } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

const services = [
  {
    title: "Website design & development",
    description: "Distinctive, responsive websites built around your brand, users and business objectives.",
    capabilities: [
      "UI/UX design",
      "Responsive web development",
      "Landing and corporate websites",
      "Accessibility and technical SEO foundations",
      "Performance and analytics foundations",
    ],
  },
  {
    title: "SaaS & digital products",
    description: "Thoughtfully designed digital products that transform complex workflows into intuitive experiences.",
    capabilities: [
      "Product strategy and discovery",
      "SaaS interface design and dashboards",
      "Authentication and user flows",
      "API, subscription and billing integrations",
      "Scalable application architecture",
    ],
  },
  {
    title: "Interactive web experiences",
    description: "Engaging, motion-rich interfaces that give brands a distinctive digital presence.",
    capabilities: [
      "Microinteractions and motion design",
      "Scroll-driven storytelling",
      "Interactive product demonstrations",
      "Advanced landing pages",
      "3D and spatial interfaces when appropriate",
    ],
  },
  {
    title: "Optimization & maintenance",
    description: "Reliable digital experiences maintained and improved as your business grows.",
    capabilities: [
      "Performance optimization",
      "Technical maintenance and bug fixing",
      "Responsive improvements",
      "SEO foundations",
      "Monitoring and iterative enhancements where supported",
    ],
  },
];

export function ServiceList() {
  const [openIndex, setOpenIndex] = useState(0);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = services.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    triggers.current[moves[event.key]]?.focus();
  };

  return (
    <div className="service-list" data-stagger>
      {services.map((service, index) => {
        const isOpen = openIndex === index;
        const triggerId = `service-trigger-${index}`;
        const panelId = `service-panel-${index}`;

        return (
          <article
            className={`service-row${isOpen ? " is-open" : ""}`}
            key={service.title}
            data-reveal
            data-spotlight
          >
            <button
              id={triggerId}
              ref={(node) => {
                triggers.current[index] = node;
              }}
              className="service-trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="service-number">0{index + 1}</span>
              <span className="service-title">{service.title}</span>
              <span className="service-summary">{service.description}</span>
              <span className="service-expand" aria-hidden="true"><Plus size={19} strokeWidth={1.5} /></span>
            </button>
            <div
              className="service-panel"
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="service-panel-inner">
                <ul>
                  {service.capabilities.map((capability, capabilityIndex) => (
                    <li key={capability} style={{ transitionDelay: isOpen ? `${120 + capabilityIndex * 55}ms` : "0ms" }}>
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
