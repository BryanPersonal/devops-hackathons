import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export default function Mermaid({ chart }: MermaidProps): JSX.Element {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    if (mermaidRef.current && chart) {
      const id = idRef.current;
      const element = mermaidRef.current;
      
      // Clear previous content
      element.innerHTML = '';
      element.id = id;
      
      // Set the mermaid diagram code
      element.textContent = chart;
      
      // Trigger mermaid to render
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div ref={mermaidRef} className="mermaid" />;
}

