
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const renderWithLatex = (text: string) => {
  if (!text) {
    return null;
  }
  const parts = text.split(/(<\/?(?:math|blockmath)>)/);

  return parts.map((part, i) => {
    if (part === '<math>') {
      const latexContent = parts[i + 1] || '';
      return <Latex key={i}>{`$${latexContent.replace(/\\\\/g, '\\')}$`}</Latex>;
    }
    if (part === '<blockmath>') {
      const latexContent = parts[i + 1] || '';
      return <Latex key={i}>{`$$${latexContent.replace(/\\\\/g, '\\')}$$`}</Latex>;
    }
    if (part === '</math>' || part === '</blockmath>' || parts[i-1] === '<math>' || parts[i-1] === '<blockmath>') {
      return null;
    }
    return <span key={i}>{part}</span>;
  });
};


const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const jsonStartIndex = content.lastIndexOf('json{');

  if (jsonStartIndex === -1) {
    return <>{renderWithLatex(content)}</>;
  }

  const leadingText = content.substring(0, jsonStartIndex).trim();
  const jsonBlockString = content.substring(jsonStartIndex + 4);

  let qnaContent: Record<string, string> | null = null;
  let trailingText = '';

  try {
    let braceCount = 0;
    let jsonEndIndex = -1;
    for (let i = 0; i < jsonBlockString.length; i++) {
        if (jsonBlockString[i] === '{') {
            braceCount++;
        } else if (jsonBlockString[i] === '}') {
            braceCount--;
        }
        if (braceCount === 0 && jsonBlockString[i] === '}') {
            jsonEndIndex = i;
            break;
        }
    }

    if (jsonEndIndex !== -1) {
        const jsonString = jsonBlockString.substring(0, jsonEndIndex + 1);
        qnaContent = JSON.parse(jsonString);
        trailingText = jsonBlockString.substring(jsonEndIndex + 1).trim();
    }
  } catch (e) {
    // Malformed JSON, render as is
    return <>{renderWithLatex(content)}</>;
  }
  
  if (qnaContent && typeof qnaContent === 'object' && !Array.isArray(qnaContent) && Object.keys(qnaContent).length > 0) {
      return (
        <div>
          {leadingText && (
            <div className="mb-4">
              {renderWithLatex(leadingText)}
            </div>
          )}
          <ul className="space-y-1">
            {Object.entries(qnaContent).map(([label, answer]) => (
              <li key={label} className="flex">
                <span className="mr-2">{label}.</span>
                <div>{renderWithLatex(answer)}</div>
              </li>
            ))}
          </ul>
          {trailingText && (
              <div className="mt-4">
                  {renderWithLatex(trailingText)}
              </div>
          )}
        </div>
      );
  }
  
  // Fallback for content that doesn't match expected structures
  return <>{renderWithLatex(content)}</>;
};

export default FormattedMessage;
