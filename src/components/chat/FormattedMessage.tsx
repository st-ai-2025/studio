import { memo, Fragment } from 'react';
import Latex from 'react-latex-next';

type FormattedMessageProps = {
  content: string;
  isUser: boolean;
};

type PersonalizedChatOutput = {
    response: string;
    answers?: {
        [key: string]: string;
    }
}

const renderText = (text: string) => {
    if (!text) return null;

    const spacedText = text.replace(/([.!?])(\w)/g, '$1 $2');
    
    const parts = spacedText.split(/(<math>.*?<\/math>|<blockmath>.*?<\/blockmath>|\*\*.*?\*\*)/g);

    return parts.filter(part => part).map((part, index) => {
        if (part.startsWith('<math>')) {
            let latex = part.substring(6, part.length - 7);
            latex = latex.replace(/\\\\/g, '\\');
            return <Latex key={index}>{`$${latex}$`}</Latex>;
        }
        if (part.startsWith('<blockmath>')) {
            let latex = part.substring(11, part.length - 12);
            latex = latex.replace(/\\\\/g, '\\');
            return <Latex key={index}>{`$$${latex}$$`}</Latex>;
        }
        if (part.startsWith('**')) {
            const boldText = part.substring(2, part.length - 2);
            if (boldText === '[Before you exit, please take the survey by clicking the button below.]') {
                return <strong key={index} className="font-bold text-red-600 block">{boldText}</strong>;
            }
            return <strong key={index} className="font-bold text-blue-600">{boldText}</strong>;
        }

        return part.split('\n').map((line, i, arr) => (
            <Fragment key={`${index}-${i}`}>
                {line}
                {i < arr.length - 1 && <br />}
            </Fragment>
        ));
    });
};

function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  if (isUser) {
    return <>{content}</>;
  }

  const isJson = content.trim().startsWith('{') || content.trim().startsWith('```json');

  if (isJson) {
      try {
        let jsonContent = content;
        if (content.trim().startsWith('```json')) {
            jsonContent = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
        }
        
        const parsed: PersonalizedChatOutput = JSON.parse(jsonContent);
        const { response, answers } = parsed;
        
        const questionRegex = /(?:\*\*Question:\*\*|Question:)\s*(.*)$/;
        const match = response.match(questionRegex);

        let mainResponse = response;
        let questionText = null;

        if (match && typeof match.index === 'number') {
          questionText = match[1];
          mainResponse = response.substring(0, match.index).trim();
        }

        return (
          <>
            <div>{renderText(mainResponse)}</div>
            {questionText && (
                <div className="mt-4">
                    <strong className="font-bold text-blue-600">Question:</strong>
                    <span className="ml-1">{renderText(questionText)}</span>
                </div>
            )}
            {answers && (
              <div className="mt-2 space-y-2">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="flex items-start">
                    <strong className="mr-2">{key}:</strong>
                    <span>
                      {renderText(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      } catch (e) {
        return <div>{renderText(content)}</div>;
      }
  }

  return <div>{renderText(content)}</div>;
}

export default memo(FormattedMessage);
