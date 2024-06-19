import React, { useRef } from 'react';

interface ToggleButtonProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    name: string;
    label?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ checked, onChange, className = '', name, label }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current) {
            const syntheticEvent = {
                target: {
                    ...inputRef.current,
                    checked: !checked,
                    name: inputRef.current.name,
                    type: inputRef.current.type,
                },
                currentTarget: {
                    ...inputRef.current,
                    checked: !checked,
                    name: inputRef.current.name,
                    type: inputRef.current.type,
                },
                bubbles: true,
                cancelable: false,
                defaultPrevented: false,
                eventPhase: 0,
                isTrusted: true,
                nativeEvent: new Event('change', { bubbles: true }),
                preventDefault: () => {},
                isDefaultPrevented: () => false,
                stopPropagation: () => {},
                isPropagationStopped: () => false,
                persist: () => {},
                timeStamp: Date.now(),
                type: 'change',
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
    };

    return (
        <div className={className + ' flex items-center gap-3'}>
            <h3 className='label'>{label}</h3>
            <div
                className={`${checked ? 'bg-selectedButton justify-end' : 'bg-typo_light-100 justify-start'} flex items-center h-8 p-1 rounded-full w-14 ${className}`}
                onClick={handleClick}
            >
                <div className="rounded-full bg-white h-7 w-7 cursor-pointer"></div>
                <input
                    type="checkbox"
                    name={name}
                    className="hidden"
                    checked={checked}
                    onChange={onChange}
                    ref={inputRef}
                />
            </div>
        </div>
    );
};

export default ToggleButton;
