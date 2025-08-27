
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
  });
};


const FormattedMessage = ({ content }: FormattedMessageProps) => {
  return <>{renderWithLatex(content)}</>;
};

export default FormattedMessage;
