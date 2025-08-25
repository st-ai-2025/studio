
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
      } else {
        // Fallback for slightly malformed json block
        const altJsonStartIndex = content.indexOf(match[0]);
        if (altJsonStartIndex !== -1) {
            leadingText = content.substring(0, altJsonStartIndex);
        }
      }
    } catch (e) {
      // Not a valid JSON, fall through to render as plain text.
    }
  }

  // If the entire message is a JSON object without the 'json' prefix
  if (!qnaContent) {
    try {
      qnaContent = JSON.parse(content);
      leadingText = ''; // The entire message is the JSON
    } catch (e) {
      // Not a valid JSON object
    }
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
      </div>
    );
  }
  
  // Fallback for non-JSON or malformed content, handles markdown and latex
  return (
      <Latex>{content}</Latex>
  );
};

export default FormattedMessage;
