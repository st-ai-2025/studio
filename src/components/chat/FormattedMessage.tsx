
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
  isUser: boolean;
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
            // Add a specific class for bolded text
            return <strong key={i} className="font-bold text-blue-600">{content}</strong>;
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
    } else if (char === '\\' && i + 1 < text.length) {
      // Skip the escaped character
      i++;
      continue;
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

const renderQaBlock = (rawText: string, isUser: boolean) => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  const text = rawText
    .replace(/<blockmath>/g, '$$')
    .replace(/<\/blockmath>/g, '$$')
    .replace(/<math>/g, '$')
    .replace(/<\/math>/g, '$');

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
      const sanitizedJsonString = jsonString.replace(/\\([^\\])/g, '\\\\$1');
      const qaData = JSON.parse(sanitizedJsonString);
      
      const questionText = qaData.question;
      const answerEntries = Object.entries(qaData.answers).map(([key, value]) => {
        return [key, value as string] as [string, string];
      });

      elements.push(
        <div key={`qa-${lastIndex}`} className="space-y-2 my-4">
          <div>
            <strong>Question: </strong>
            {renderWithLatex(questionText)}
          </div>
          {answerEntries.map(([key, value]) => (
            <div key={key}><strong>{key}: </strong>{renderWithLatex(value)}</div>
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


const FormattedMessage = ({ content, isUser }: FormattedMessageProps) => {
  const processedContent = isUser ? content : content.replace(/\$/g, 'USD');

  const paragraphs = processedContent.split('\n\n').map((paragraph, i) => (
    <div key={i} className="my-1">
      {renderQaBlock(paragraph, isUser)}
    </div>
  ));
  
  return <>{paragraphs}</>;
};

export default FormattedMessage;
