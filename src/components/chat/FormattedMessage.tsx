
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const jsonStartIndex = content.lastIndexOf('json{');

  if (jsonStartIndex === -1) {
    return <Latex>{content}</Latex>;
  }

  const leadingText = content.substring(0, jsonStartIndex).trim();
  const jsonBlock = content.substring(jsonStartIndex + 4); // +4 to skip "json"

  let qnaContent: Record<string, string> | null = null;
  let trailingText = '';

  try {
    // Find the matching closing brace for the json content
    let braceCount = 0;
    let jsonEndIndex = -1;
    for (let i = 0; i < jsonBlock.length; i++) {
        if (jsonBlock[i] === '{') {
            braceCount++;
        } else if (jsonBlock[i] === '}') {
            braceCount--;
        }
        if (braceCount === 0) {
            jsonEndIndex = i;
            break;
        }
    }

    if (jsonEndIndex !== -1) {
        const jsonString = jsonBlock.substring(0, jsonEndIndex + 1);
        qnaContent = JSON.parse(jsonString);
        trailingText = jsonBlock.substring(jsonEndIndex + 1).trim();
    } else {
        // Fallback if no matching brace is found
        return <Latex>{content}</Latex>;
    }
  } catch (e) {
    // Malformed JSON, render as is
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
  
  // Fallback for content that doesn't match expected structures
  return <Latex>{content}</Latex>;
};

export default FormattedMessage;
