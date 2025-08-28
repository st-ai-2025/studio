
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
              return <strong key={i} className="text-primary">{content}</strong>
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

const renderQaBlock = (text: string) => {
  const qaRegex = /qa_block:({[\s\S]+?})(?=\n\n|\n\s*\n|$)/g;
  
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];
  let match;

  while ((match = qaRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      elements.push(renderWithLatex(text.substring(lastIndex, match.index)));
    }
    
    try {
      const jsonString = match[1];
      const qaData = JSON.parse(jsonString);

      elements.push(
        <div key={match.index} className="space-y-2 my-4">
          <div className="font-semibold">{renderWithLatex(qaData.question)}</div>
          {Object.entries(qaData.answers).map(([key, value]) => (
            <div key={key}>{renderWithLatex(`${key}: ${value}`)}</div>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Error parsing qa_block:", error);
      // If parsing fails, render the original block as plain text
      elements.push(renderWithLatex(match[0]));
    }
    
    lastIndex = qaRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    elements.push(renderWithLatex(text.substring(lastIndex)));
  }

  return elements;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  // Split the content by newlines to process paragraph by paragraph
  // This helps in isolating qa_blocks that might span multiple lines
  const paragraphs = content.split('\n').map((p, i) => (
    <div key={i} className="my-1">
      {renderQaBlock(p)}
    </div>
  ));
  
  return <>{paragraphs}</>;
};

export default FormattedMessage;
