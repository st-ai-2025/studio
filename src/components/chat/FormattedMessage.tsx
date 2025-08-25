
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const jsonRegex = /json({[\s\S]*})/;
  const match = content.match(jsonRegex);
  let jsonContent = null;

  if (match && match[1]) {
    try {
      jsonContent = JSON.parse(match[1]);
    } catch (e) {
      // It looked like a JSON block, but wasn't valid JSON.
      // We will fall through and render the original content.
    }
  }
  
  // If no JSON block was found, try parsing the whole content.
  if (!jsonContent) {
    try {
      jsonContent = JSON.parse(content);
    } catch (error) {
      // Not a valid JSON. Fallback to original rendering.
    }
  }
  
  if (jsonContent && jsonContent.question && Array.isArray(jsonContent.answers)) {
    return (
      <div>
        <p className="mb-2"><Latex>{jsonContent.question}</Latex></p>
        <ul className="space-y-1">
          {jsonContent.answers.map((ans: { label: string, answer: string }, index: number) => (
            <li key={index}>
              {ans.label}. <Latex>{ans.answer}</Latex>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  // Fallback for non-JSON or malformed content
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
