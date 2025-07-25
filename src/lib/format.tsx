
"use client";

import React from 'react';
import Latex from "react-latex-next";

const surveyText = "[Before you exit, please take the survey by clicking the button below.]";

function formatLine(line: string) {
  if (!line) return null;
  // Regex to match all supported patterns: LaTeX (inline and display), survey link, bold, and italics, or plain text chunks.
  const regex = /(\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|\[Before you exit, please take the survey by clicking the button below\.\]|[\s\S]+?)/g;
  const parts = line.match(regex) || [];

  return parts.map((part, index) => {
    if (!part) return null;

    // Display LaTeX
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <Latex key={index}>{part}</Latex>;
    }
    // Inline LaTeX
    if (part.startsWith('$') && part.endsWith('$')) {
      return <Latex key={index}>{part}</Latex>;
    }
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Italics
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    // Survey Link
    if (part === surveyText) {
        return <span key={index} className="text-red-500 font-bold">{part}</span>
    }
    // Plain text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function formatMessage(text: string) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {formatLine(line)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}
