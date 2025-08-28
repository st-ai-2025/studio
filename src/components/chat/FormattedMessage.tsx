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
  const qaRegex = /qalock:({[\s\S]*?})/g;
  const parts = text.split(qaRegex);

  return parts.map((part, index) => {
    if (index % 2 === 1) { // This is a qalock
      try {
        // The regex might capture trailing characters, so we need to find the correct closing brace
        let braceCount = 0;
        let jsonEndIndex = -1;
        for (let i = 0; i < part.length; i++) {
          if (part[i] === '{') {
            braceCount++;
          } else if (part[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEndIndex = i;
              break;
            }
          }
        }

        if (jsonEndIndex === -1) {
            // Malformed JSON, render as plain text
            return renderWithLatex(`qalock:${part}`);
        }

        const jsonString = part.substring(0, jsonEndIndex + 1);
        
        // This is a bit of a hack, but since the source isn't valid JSON, we parse it manually
        const questionMatch = jsonString.match(/question:\s*{(.*?)}/s);
        const answersMatch = jsonString.match(/answers:\s*{([\s\S]*?)}/s);

        if (!questionMatch || !answersMatch) {
          throw new Error("Invalid qalock structure");
        }

        const question = questionMatch[1].trim();
        const answersContent = `{${answersMatch[1]}}`;
        // Replace single quotes and fix keys for JSON parsing
        const validJsonAnswers = answersContent.replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
        const answers = JSON.parse(validJsonAnswers);

        return (
          <div key={index} className="space-y-2">
            <div>{renderWithLatex(question)}</div>
            {Object.entries(answers).map(([key, value]) => (
              <div key={key}>{renderWithLatex(`${key}: ${value}`)}</div>
            ))}
          </div>
        );
      } catch (error) {
        console.error("Error parsing qalock:", error);
        // If parsing fails, render the original block
        return renderWithLatex(`qalock:${part}`);
      }
    } else {
      return renderWithLatex(part);
    }
  });
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  return <>{renderQaBlock(content)}</>;
};

export default FormattedMessage;
