
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.question && Array.isArray(parsed.answers)) {
      return (
        <div>
          <p className="mb-2"><Latex>{parsed.question}</Latex></p>
          <ul className="space-y-1">
            {parsed.answers.map((ans: { label: string, answer: string }, index: number) => (
              <li key={index}>
                {ans.label}. <Latex>{ans.answer}</Latex>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  } catch (error) {
    // Not a valid JSON, or not the format we expect. Fallback to original rendering.
  }
  
  return (
    <>
      {content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={partIndex} style={{ color: 'blue' }}>
              <Latex>{boldText}</Latex>
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            const italicText = part.slice(1, -1);
            return (
                <em key={partIndex}>
                    <Latex>{italicText}</Latex>
                </em>
            );
        }
        return <Latex key={partIndex}>{part}</Latex>;
      })}
    </>
  );
};

export default FormattedMessage;
