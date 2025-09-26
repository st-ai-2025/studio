
interface JotformFeedbackOptions {
    formId: string;
    buttonText?: string;
    base: string;
    background?: string;
    fontColor?: string;
    buttonSide?: 'bottom' | 'top' | 'left' | 'right';
    buttonAlign?: 'left' | 'right' | 'center';
    type?: 'pop-up' | 'iframe';
    height?: number;
    width?: number;
    isCardForm?: boolean;
}

declare class JotformFeedback {
    constructor(options: JotformFeedbackOptions);
}

// Add to the global window object
declare global {
    interface Window {
        JotformFeedback: typeof JotformFeedback;
    }
}

export {};
