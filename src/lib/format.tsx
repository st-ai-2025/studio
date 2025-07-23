
"use client";

import React from 'react';
import Latex from "react-latex-next";

export function formatMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\$.*?\$|\$\$[\s\S]*?\$\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <Latex key={index}>{part}</Latex>;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <Latex key={index}>{part}</Latex>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
