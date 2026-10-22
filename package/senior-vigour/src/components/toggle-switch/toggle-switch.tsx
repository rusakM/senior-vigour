import type { FC } from 'react';
import styles from './toggle-switch.module.scss';

export interface ToggleSwitchProps {
    value: boolean;
    onToggle: () => void;
    label: string;
    disabled?: boolean;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({
    value,
    onToggle,
    label,
    disabled = false,
}) => {
    const handleClick = () => {
        if (!disabled) {
            onToggle();
        }
    };

    return (
        <div className={styles.toggleContainer}>
            <button
                type="button"
                role="switch"
                aria-checked={value}
                aria-label={label}
                disabled={disabled}
                className={`${styles.toggleSwitch} ${value ? styles.on : styles.off}`}
                onClick={handleClick}
                data-testid="edit-profile-toggle"
            >
                <span className={styles.toggleCircle} />
            </button>
            <span className={styles.toggleLabel} onClick={handleClick}>
                {label}
            </span>
        </div>
    );
};

export default ToggleSwitch;
