
"use client";

import React from 'react';
import Latex from "react-latex-next";

const surveyText = "[Before you exit, please take the survey by clicking the button below.]";
const surveyRegex = /\[Before you exit, please take the survey by clicking the button below\.\]/;

export function formatMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\$.*?\$|\$\$[\s\S]*?\$\$|\[Before you exit, please take the survey by clicking the button below\.\])/g);

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
        if (surveyRegex.test(part)) {
            return <span key={index} className="text-red-500 font-bold">{part}</span>
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
