import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import styles from './select-input.module.scss';

export interface ISelectInputOption {
    label: string;
    value: string;
}

export interface SelectInputProps {
    options: ISelectInputOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    error?: boolean;
    initialOpened?: boolean;
    emptyText?: string;
    className?: string;
}

export const SelectInput: FC<SelectInputProps> = ({
    options,
    value,
    onChange,
    placeholder,
    name,
    id,
    disabled = false,
    error = false,
    initialOpened = false,
    emptyText = 'No results found',
    className,
}) => {
    const [isOpened, setIsOpened] = useState<boolean>(initialOpened);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpened(false);
                setIsSearching(false);
                setSearchPhrase('');
            }
        };

        if (isOpened) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpened]);

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpened(true);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsSearching(true);
        setSearchPhrase(e.target.value);
        if (!isOpened) {
            setIsOpened(true);
        }
    };

    const handleSelectOption = (option: ISelectInputOption) => {
        if (onChange) {
            onChange(option.value);
        }
        setIsOpened(false);
        setIsSearching(false);
        setSearchPhrase('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpened(false);
            setIsSearching(false);
            setSearchPhrase('');
        }
    };

    const handleToggleDropdown = () => {
        if (!disabled) {
            setIsOpened((prev) => {
                const nextState = !prev;
                if (!nextState) {
                    setIsSearching(false);
                    setSearchPhrase('');
                } else {
                    inputRef.current?.focus();
                }
                return nextState;
            });
        }
    };

    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = isSearching
        ? searchPhrase
        : (selectedOption ? selectedOption.label : '');

    const filteredOptions = isSearching && searchPhrase.trim() !== ''
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchPhrase.toLowerCase())
        )
        : options;

    return (
        <div
            ref={containerRef}
            className={`${styles.selectContainer} ${className || ''}`}
        >
            <div className={styles.selectInputWrapper}>
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="text"
                    className={`${styles.selectInput} ${error ? styles.errorInput : ''}`}
                    placeholder={placeholder}
                    value={displayValue}
                    disabled={disabled}
                    onClick={handleInputClick}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    aria-expanded={isOpened}
                    aria-haspopup="listbox"
                />
                <button
                    type="button"
                    className={styles.chevronButton}
                    onClick={handleToggleDropdown}
                    disabled={disabled}
                    aria-label="Toggle dropdown"
                    tabIndex={-1}
                >
                    <svg
                        className={`${styles.chevronIcon} ${isOpened ? styles.open : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {isOpened && (
                <ul className={styles.selectDropdown} role="listbox">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`${styles.selectOption} ${
                                        isSelected ? styles.selectedOption : ''
                                    }`}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {option.label}
                                </li>
                            );
                        })
                    ) : (
                        <li className={styles.selectOptionEmpty} role="option" aria-disabled="true">
                            {emptyText}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SelectInput;
