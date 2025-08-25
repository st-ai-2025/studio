
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

  const jsonBlock = match[1];
  const jsonString = match[2];
  const parts = content.split(jsonBlock);
  const leadingText = parts[0];
  const trailingText = parts[1];

  let qnaContent = null;
  try {
    qnaContent = JSON.parse(jsonString);
  } catch (e) {
    // If parsing fails, render the whole message as is.
    return <Latex>{content}</Latex>;
  }

  if (qnaContent && qnaContent.question && Array.isArray(qnaContent.answers)) {
    return (
      <div>
        {leadingText && (
          <div className="mb-4">
            <Latex>{leadingText}</Latex>
          </div>
        )}
        <div className="mb-2">
          <Latex>{qnaContent.question}</Latex>
        </div>
        <ul className="space-y-1">
          {qnaContent.answers.map((ans: { label: string, answer: string }, index: number) => (
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

  // Fallback for non-JSON or malformed content
  return <Latex>{content}</Latex>;
};

export default FormattedMessage;
