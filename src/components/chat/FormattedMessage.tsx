
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={index} style={{ color: 'blue' }}>
                <Latex>{boldText}</Latex>
            </strong>
          );
        }
        return <Latex key={index}>{part}</Latex>;
      })}
    </>
  );
};

export default FormattedMessage;
