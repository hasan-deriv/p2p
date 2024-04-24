import { ChangeEventHandler, HtmlHTMLAttributes, useState } from 'react';
import clsx from 'clsx';
import { Text } from '@deriv-com/ui';
import './TextArea.scss';

type TTextAreaProps = HtmlHTMLAttributes<HTMLTextAreaElement> & {
    hint?: string;
    isInvalid?: boolean;
    label?: string;
    maxLength?: number;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    shouldShowCounter?: boolean;
    testId?: string;
    value?: string;
};
const TextArea = ({
    hint,
    isInvalid = false,
    label,
    maxLength,
    onChange,
    placeholder,
    shouldShowCounter = false,
    testId,
    value,
}: TTextAreaProps) => {
    const [currentValue, setCurrentValue] = useState(value);

    return (
        <div
            className={clsx('textarea', {
                'textarea--error': isInvalid,
            })}
            data-testid={testId}
        >
            <textarea
                data-has-value={!!currentValue}
                onChange={event => {
                    setCurrentValue(event.target.value);
                    onChange?.(event);
                }}
                placeholder={placeholder}
                value={currentValue}
            />
            {label && (
                <label>
                    <Text color={isInvalid ? 'error' : 'less-prominent'} size='sm'>
                        {label}
                    </Text>
                </label>
            )}
            <div className='textarea__footer'>
                {hint && (
                    <Text as='p' color={isInvalid ? 'error' : 'less-prominent'} size='xs'>
                        {hint}
                    </Text>
                )}
                {shouldShowCounter && (
                    <Text color={isInvalid ? 'error' : 'less-prominent'} size='xs'>
                        {currentValue?.length || 0}/{maxLength}
                    </Text>
                )}
            </div>
        </div>
    );
};

export default TextArea;