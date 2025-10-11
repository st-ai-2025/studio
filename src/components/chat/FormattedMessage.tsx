
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const applyFormatting = (text: string): React.ReactNode[] => {
    // Split by bold and italic markers, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*)|(\*.*?\*)/g).filter(Boolean);

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            if (content === '[Before you exit, please take the survey by clicking the button below.]') {
              return <strong key={i} className="text-destructive">{content}</strong>
            }
            return <strong key={i}>{content}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
    });
};

const renderWithLatex = (text: string) => {
  if (!text) {
    return null;
  }
  return <Latex>{text}</Latex>;
};

const findJsonEnd = (text: string, startIndex: number) => {
  let openBraces = 0;
  let inString = false;
  let i = startIndex;
  
  // Find the opening brace
  while(i < text.length && text[i] !== '{') {
    i++;
  }
  if (i === text.length) return -1; // No opening brace found

  startIndex = i;
  
  for (;i < text.length; i++) {
    const char = text[i];
    if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (!inString) {
      if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
          return i + 1;
        }
      }
    }
  }
  return -1; // Not found
};

const renderQaBlock = (rawText: string) => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Pre-process the entire text to replace custom math tags with standard delimiters.
  // This avoids JSON parsing errors with backslashes in LaTeX.
  const text = rawText
    .replace(/<blockmath>/g, '$$')
    .replace(/<\/blockmath>/g, '$$')
    .replace(/<math>/g, '$')
    .replace(/<\/math>/g, '$')


  while (lastIndex < text.length) {
    const qaBlockStartIndex = text.indexOf('qa_block:', lastIndex);
    if (qaBlockStartIndex === -1) {
      elements.push(applyFormatting(text.substring(lastIndex)));
      break;
    }

    // Add the text before the qa_block
    if (qaBlockStartIndex > lastIndex) {
      elements.push(applyFormatting(text.substring(lastIndex, qaBlockStartIndex)));
    }

    const jsonStartIndex = text.indexOf('{', qaBlockStartIndex);
    if (jsonStartIndex === -1) {
      elements.push(applyFormatting(text.substring(qaBlockStartIndex)));
      break;
    }

    const jsonEndIndex = findJsonEnd(text, jsonStartIndex);
    if (jsonEndIndex === -1) {
      elements.push(applyFormatting(text.substring(qaBlockStartIndex)));
      break;
    }

    const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
    try {
      // THIS IS THE FIX: Escape backslashes before parsing JSON.
      const sanitizedJsonString = jsonString.replace(/\\/g, '\\\\');
      const qaData = JSON.parse(sanitizedJsonString);
      elements.push(
        <div key={`qa-${lastIndex}`} className="space-y-2 my-4">
          <div>
            <strong>Question: </strong>
            {renderWithLatex(qaData.question)}
          </div>
          {Object.entries(qaData.answers).map(([key, value]) => (
            <div key={key}><strong>{key}: </strong>{renderWithLatex(value as string)}</div>
          ))}
        </div>
      );
      lastIndex = jsonEndIndex;
    } catch (error) {
      const problematicText = text.substring(qaBlockStartIndex, jsonEndIndex);
      console.error("Error parsing qa_block:", error, "original text:", problematicText);
      elements.push(applyFormatting(problematicText));
      lastIndex = jsonEndIndex;
    }
  }

  return elements;
};


const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const paragraphs = content.split('\n\n').map((paragraph, i) => (
    <div key={i} className="my-1">
      {renderQaBlock(paragraph)}
    </div>
  ));
  
  return <>{paragraphs}</>;
};

export default FormattedMessage;
