
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
  
  // Regex to split by <math>...</math> and <blockmath>...</blockmath>
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
    // Filter out the closing tags and the content that has been processed
    if (part === '</math>' || part === '</blockmath>' || parts[i-1] === '<math>' || parts[i-1] === '<blockmath>') {
      return null;
    }
    // For regular text parts, apply bold/italic formatting
    return applyFormatting(part);
  }).filter(Boolean);
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
      }
    }
    if (openBraces === 0) {
      return i + 1;
    }
  }
  return -1; // Not found
};

const renderQaBlock = (text: string) => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  while (lastIndex < text.length) {
    const qaBlockStartIndex = text.indexOf('qa_block:', lastIndex);
    if (qaBlockStartIndex === -1) {
      elements.push(renderWithLatex(text.substring(lastIndex)));
      break;
    }

    // Add the text before the qa_block
    if (qaBlockStartIndex > lastIndex) {
      elements.push(renderWithLatex(text.substring(lastIndex, qaBlockStartIndex)));
    }

    const jsonStartIndex = text.indexOf('{', qaBlockStartIndex);
    if (jsonStartIndex === -1) {
      // No JSON object found, treat the rest as regular text
      elements.push(renderWithLatex(text.substring(qaBlockStartIndex)));
      break;
    }

    const jsonEndIndex = findJsonEnd(text, jsonStartIndex);
    if (jsonEndIndex === -1) {
      // Incomplete JSON, treat as regular text
      elements.push(renderWithLatex(text.substring(qaBlockStartIndex)));
      break;
    }

    const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
    try {
      // Sanitize the string to escape single backslashes before parsing
      const sanitizedJsonString = jsonString.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
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
      // Parsing failed, treat the problematic part as regular text
      const problematicText = text.substring(qaBlockStartIndex, jsonEndIndex);
      console.error("Error parsing qa_block:", error, "original text:", problematicText);
      elements.push(renderWithLatex(problematicText));
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
