
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const jsonRegex = /json({[\s\S]*})/;
  const match = content.match(jsonRegex);
  let leadingText = content;
  let qnaContent = null;

  if (match && match[1]) {
    try {
      qnaContent = JSON.parse(match[1]);
      const jsonBlockWithOptions = `json${match[1]}`;
      const jsonStartIndex = content.indexOf(jsonBlockWithOptions);
      if (jsonStartIndex !== -1) {
        leadingText = content.substring(0, jsonStartIndex);
      }
    } catch (e) {
      // It looked like a JSON block, but wasn't valid JSON.
      // We will fall through and render the original content.
    }
  }

  // If no JSON block was found, try parsing the whole content.
  if (!qnaContent) {
    try {
      qnaContent = JSON.parse(content);
      leadingText = ''; // Whole message is JSON
    } catch (error) {
      // Not a valid JSON. Fallback to original rendering.
    }
  }
  
  if (qnaContent && qnaContent.question && Array.isArray(qnaContent.answers)) {
    return (
      <div>
        {leadingText && leadingText !== `json${match?.[1]}` && (
            <p className="mb-4"><Latex>{leadingText}</Latex></p>
        )}
        <p className="mb-2"><Latex>{qnaContent.question}</Latex></p>
        <ul className="space-y-1">
          {qnaContent.answers.map((ans: { label: string, answer: string }, index: number) => (
            <li key={index}>
              <Latex>{`${ans.label}. ${ans.answer}`}</Latex>
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
            <strong key={partIndex}>
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
