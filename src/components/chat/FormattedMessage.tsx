
"use client";

import React from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
};

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              return (
                <strong key={partIndex} style={{ color: 'blue' }}>
                  <Latex>{boldText}</Latex>
                </strong>
              );
            }
            return <Latex key={partIndex}>{part}</Latex>;
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default FormattedMessage;
