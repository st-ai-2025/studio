
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const jsonRegex = /(json({[\s\S]*}))/;
  const match = content.match(jsonRegex);

  if (!match) {
    return <Latex>{content}</Latex>;
  }

  const jsonString = match[2];
  const fullJsonBlock = match[1];
  
  const parts = content.split(fullJsonBlock);
  const leadingText = parts[0];
  const trailingText = parts.slice(1).join(fullJsonBlock);

  let qnaContent: Record<string, string> | null = null;
  try {
    qnaContent = JSON.parse(jsonString);
  } catch (e) {
    return <Latex>{content}</Latex>;
  }

  if (qnaContent && typeof qnaContent === 'object' && !Array.isArray(qnaContent) && Object.keys(qnaContent).length > 0) {
    const isAnswerBlock = Object.keys(qnaContent).every(key => typeof key === 'string' && typeof qnaContent![key] === 'string');
    
    if (isAnswerBlock) {
      return (
        <div>
          {leadingText && (
            <div className="mb-4">
              <Latex>{leadingText}</Latex>
            </div>
          )}
          <ul className="space-y-1">
            {Object.entries(qnaContent).map(([label, answer]) => (
              <li key={label}>
                <Latex>{`${label}. ${answer}`}</Latex>
              </li>
            ))}
          </ul>
          {trailingText && (
              <div className="mt-4">
                  <Latex>{trailingText}</Latex>
              </div>
          )}
        </div>
      );
    }
  }

  // Fallback for previous JSON format or malformed content
  try {
    const oldFormat = JSON.parse(jsonString);
    if (oldFormat && oldFormat.question && Array.isArray(oldFormat.answers)) {
      return (
        <div>
          {leadingText && (
            <div className="mb-4">
              <Latex>{leadingText}</Latex>
            </div>
          )}
          <div className="mb-2">
            <Latex>{oldFormat.question}</Latex>
          </div>
          <ul className="space-y-1">
            {oldFormat.answers.map((ans: { label: string, answer: string }, index: number) => (
              <li key={index}>
                <Latex>{`${ans.label}. ${ans.answer}`}</Latex>
              </li>
            ))}
          </ul>
          {trailingText && (
              <div className="mt-4">
                  <Latex>{trailingText}</Latex>
              </div>
          )}
        </div>
      );
    }
  } catch (e) {
    // Fallback if neither format parses
    return <Latex>{content}</Latex>;
  }


  // Fallback for content that doesn't match expected structures
  return <Latex>{content}</Latex>;
};

export default FormattedMessage;
