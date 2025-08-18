
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  return (
    <>
      {content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={partIndex} style={{ color: 'blue' }}>
              <Latex>{boldText}</Latex>
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            const italicText = part.slice(1, -1);
            return (
                <em key={partIndex}>
                    <Latex>{italicText}</Latex>
                </em>
            );
        }
        return <Latex key={partIndex}>{part}</Latex>;
      })}
    </>
  );
};

export default FormattedMessage;
