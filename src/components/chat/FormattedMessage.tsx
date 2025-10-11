
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

  const text = rawText
    .replace(/<blockmath>/g, '$$')
    .replace(/<\/blockmath>/g, '$$')
    .replace(/<math>/g, '$')
    .replace(/<\/math>/g, '$')


  while (lastIndex < text.length) {
    const qaBlockStartIndex = text.indexOf('qa_block:', lastIndex);
    if (qaBlockStartIndex === -1) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        elements.push(<React.Fragment key={`text-${lastIndex}`}>{renderWithLatex(remainingText)}</React.Fragment>);
      }
      break;
    }

    const textBefore = text.substring(lastIndex, qaBlockStartIndex);
    if (textBefore) {
      elements.push(<React.Fragment key={`text-${lastIndex}`}>{renderWithLatex(textBefore)}</React.Fragment>);
    }

    const jsonStartIndex = text.indexOf('{', qaBlockStartIndex);
    if (jsonStartIndex === -1) {
      const remainingText = text.substring(qaBlockStartIndex);
      elements.push(<React.Fragment key={`text-${qaBlockStartIndex}`}>{renderWithLatex(remainingText)}</React.Fragment>);
      break;
    }

    const jsonEndIndex = findJsonEnd(text, jsonStartIndex);
    if (jsonEndIndex === -1) {
      const remainingText = text.substring(qaBlockStartIndex);
      elements.push(<React.Fragment key={`text-err-${qaBlockStartIndex}`}>{renderWithLatex(remainingText)}</React.Fragment>);
      break;
    }

    const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
    try {
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
      elements.push(<React.Fragment key={`text-err-parse-${qaBlockStartIndex}`}>{renderWithLatex(problematicText)}</React.Fragment>);
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
