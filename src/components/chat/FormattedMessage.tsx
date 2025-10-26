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
    const unescapedText = spacedText.replace(/\\/g, '\\');
    
    const parts = unescapedText.split(/(<math>.*?<\/math>|<blockmath>.*?<\/blockmath>|\*\*.*?\*\*)/g);

    return parts.filter(part => part).map((part, index) => {
        if (part.startsWith('<math>')) {
            const latex = part.substring(6, part.length - 7);
            return <Latex key={index}>{`$${latex}$`}</Latex>;
        }
        if (part.startsWith('<blockmath>')) {
            const latex = part.substring(11, part.length - 12);
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
                <Latex>{line}</Latex>
                {i < arr.length - 1 && <br />}
            </Fragment>
        ));
    });
};

function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  if (isUser) {
    return <>{content}</>;
  }

  try {
    const parsed: PersonalizedChatOutput = JSON.parse(content);
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
              <div key={key}>
                <strong>{key}:</strong> {renderText(value)}
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

export default memo(FormattedMessage);
