
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
  isUser: boolean;
};

const applyFormatting = (text: string): React.ReactNode[] => {
    const mathPlaceholder = '___MATH_PLACEHOLDER___';
    const mathBlocks: string[] = [];
    const boldPlaceholder = '___BOLD_PLACEHOLDER___';
    const boldBlocks: string[] = [];
    const italicPlaceholder = '___ITALIC_PLACEHOLDER___';
    const italicBlocks: string[] = [];

    let processedText = text;
    
    // Isolate math blocks
    processedText = processedText.replace(/(<blockmath>[\s\S]*?<\/blockmath>|<math>[\s\S]*?<\/math>)/g, (match) => {
        mathBlocks.push(match);
        return mathPlaceholder;
    });

    // Isolate bold blocks
    processedText = processedText.replace(/(\*\*.*?\*\*)/g, (match) => {
        boldBlocks.push(match);
        return boldPlaceholder;
    });

    // Isolate italic blocks
    processedText = processedText.replace(/(\*.*?\*)/g, (match) => {
        italicBlocks.push(match);
        return italicPlaceholder;
    });

    const parts = processedText.split(/(___MATH_PLACEHOLDER___|___BOLD_PLACEHOLDER___|___ITALIC_PLACEHOLDER___)/g).filter(Boolean);

    let mathIndex = 0;
    let boldIndex = 0;
    let italicIndex = 0;

    return parts.map((part, i) => {
        if (part === mathPlaceholder) {
            return mathBlocks[mathIndex++];
        }
        if (part === boldPlaceholder) {
            const content = boldBlocks[boldIndex++].slice(2, -2);
            if (content === '[Before you exit, please take the survey by clicking the button below.]') {
              return <strong key={i} className="text-destructive">{content}</strong>
            }
            return <strong key={i} className="font-bold text-blue-600">{content}</strong>;
        }
        if (part === italicPlaceholder) {
            return <em key={i}>{italicBlocks[italicIndex++].slice(1, -1)}</em>;
        }
        return part;
    });
};

const renderWithLatex = (node: React.ReactNode, key: string | number) => {
  if (typeof node !== 'string') {
    // If it's already a React element (like <strong> or <em>), just add a key and return it.
    if (React.isValidElement(node)) {
        return React.cloneElement(node, { key });
    }
    return node;
  }
  
  // This is for string parts, including those that are just the math content.
  const textWithDelimiters = node
    .replace(/<blockmath>/g, '$$')
    .replace(/<\/blockmath>/g, '$$')
    .replace(/<math>/g, '$')
    .replace(/<\/math>/g, '$');
  
  // The string might contain newlines which should be preserved.
  return <span key={key}><Latex>{textWithDelimiters}</Latex></span>;
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

  const regex = /qa_block\s*[:=]?\s*/;
  const match = rawText.match(regex);

  if (match && match.index !== undefined) {
      const textBefore = rawText.substring(0, match.index);
      if (textBefore) {
          elements.push(
              <React.Fragment key={`text-before`}>
                  {applyFormatting(textBefore).map((node, i) => renderWithLatex(node, `before-${i}`))}
              </React.Fragment>
          );
      }

      const jsonStartIndex = match.index + match[0].length;
      const jsonEndIndex = findJsonEnd(rawText, jsonStartIndex);

      if (jsonEndIndex !== -1) {
          const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex);
          try {
              const sanitizedJsonString = jsonString.replace(/\\([^\\])/g, '\\\\$1');
              const qaData = JSON.parse(sanitizedJsonString);
              
              const questionText = qaData.question;
              const answerEntries = Object.entries(qaData.answers).map(([key, value]) => {
                  return [key, value as string] as [string, string];
              });

              elements.push(
                  <div key={`qa-block`} className="space-y-2 my-4">
                      <div>
                          <strong>Question: </strong>
                          {renderWithLatex(questionText, 'qa-question')}
                      </div>
                      {answerEntries.map(([key, value]) => (
                          <div key={key}><strong>{key}: </strong>{renderWithLatex(value, `qa-ans-${key}`)}</div>
                      ))}
                  </div>
              );
              lastIndex = jsonEndIndex;

              const textAfter = rawText.substring(lastIndex);
              if (textAfter) {
                elements.push(
                  <React.Fragment key={`text-after`}>
                    {applyFormatting(textAfter).map((node, i) => renderWithLatex(node, `after-${i}`))}
                  </React.Fragment>
                );
              }
              return elements;

          } catch (error) {
              console.error("Error parsing qa_block:", error, "original text:", jsonString);
          }
      }
  }

  // Fallback to render the whole text if no block is found or parsing fails
  const formattedNodes = applyFormatting(rawText);
  return formattedNodes.map((node, index) => renderWithLatex(node, index));
};


const FormattedMessage = ({ content, isUser }: FormattedMessageProps) => {
  const processedContent = isUser ? content : content;

  const paragraphs = processedContent.split('\n\n').map((paragraph, i) => (
    <div key={i} className="my-1">
      {renderQaBlock(paragraph, isUser)}
    </div>
  ));
  
  return <>{paragraphs}</>;
};

export default FormattedMessage;
