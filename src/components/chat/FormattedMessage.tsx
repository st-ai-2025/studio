
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
            return <strong key={i} className="text-[#0018F9]">{content}</strong>;
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

const renderQaBlock = (text: string) => {
  const qaRegex = /(qa_block:({[\s\S]*?}))/g;
  const parts = text.split(qaRegex);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // This is the text part (or an undefined part from capturing)
      if (parts[i]) {
        elements.push(renderWithLatex(parts[i]));
      }
    } else if (i % 2 === 1 && parts[i].startsWith('qa_block:')) {
      // This is the full qa_block part
      const jsonString = parts[i].substring('qa_block:'.length);
      if (jsonString) {
        try {
          const cleanedJsonString = jsonString.replace(/\n/g, ' ').replace(/\s+/g, ' ');
          const qaData = JSON.parse(cleanedJsonString);
          
          elements.push(
            <div key={`qa-${i}`} className="space-y-2 my-4">
              <div>
                <span className="font-semibold">Question: </span>
                {renderWithLatex(qaData.question)}
              </div>
              {Object.entries(qaData.answers).map(([key, value]) => (
                <div key={key}>{renderWithLatex(`${key}: ${value}`)}</div>
              ))}
            </div>
          );
        } catch (error) {
          console.error("Error parsing qa_block:", error, "original text:", parts[i]);
          elements.push(renderWithLatex(parts[i]));
        }
      }
      i++; // Also skip the next captured group which is just the JSON part
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
