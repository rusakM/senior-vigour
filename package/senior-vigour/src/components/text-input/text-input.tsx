import type { FC, InputHTMLAttributes } from 'react';
import styles from './text-input.module.scss';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    additionalClasses?: string;
    error?: string;
}

const TextInput: FC<TextInputProps> = ({
    additionalClasses,
    error,
    className,
    ...restProps
}) => {
    const combinedInputClass = [
        styles.input,
        error ? styles.inputError : '',
        additionalClasses || '',
        className || '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={styles.wrapper}>
            <input
                className={combinedInputClass}
                aria-invalid={Boolean(error) || restProps['aria-invalid']}
                {...restProps}
            />
            {error && (
                <span className={styles.errorText} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

export default TextInput;
