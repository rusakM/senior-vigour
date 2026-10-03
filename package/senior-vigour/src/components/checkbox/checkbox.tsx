import type { FC, ReactNode, ChangeEvent } from 'react';
import styles from './checkbox.module.scss';

export interface CheckboxProps {
    id?: string;
    name?: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: ReactNode;
    disabled?: boolean;
    additionalClasses?: string;
}

const Checkbox: FC<CheckboxProps> = ({
    id,
    name,
    checked,
    onChange,
    label,
    disabled = false,
    additionalClasses,
}) => {
    return (
        <label
            className={`${styles.checkboxContainer}${disabled ? ` ${styles.disabled}` : ''}${additionalClasses ? ` ${additionalClasses}` : ''}`}
            htmlFor={id}
        >
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className={styles.nativeCheckbox}
            />
            <span
                className={`${styles.customCheckbox}${checked ? ` ${styles.checked}` : ''}`}
                aria-hidden="true"
            >
                {checked && (
                    <svg
                        viewBox="0 0 16 16"
                        className={styles.checkmarkIcon}
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>
            <span className={styles.label}>{label}</span>
        </label>
    );
};

export default Checkbox;
