import type { FC, RefObject } from 'react';
import styles from './dropdown-menu.module.scss';

export interface DropdownMenuItem {
    key: string;
    label: string;
}

export interface DropdownMenuProps {
    isOpen: boolean;
    items: DropdownMenuItem[];
    onItemSelect?: (key: string) => void;
    reference?: RefObject<HTMLElement | null>;
}

const DropdownMenu: FC<DropdownMenuProps> = ({
    isOpen,
    items,
    onItemSelect,
    reference,
}) => {
    if (!isOpen) return null;

    const handleSelect = (key: string) => {
        if (onItemSelect) onItemSelect(key);
    };

    return (
        <aside className={styles.dropdownMenu} ref={reference || null}>
            <div className={styles.dropdownListContainer}>
                <ul className={styles.dropdownList}>
                    {items.map((item) => (
                        <li
                            key={item.key}
                            className={styles.dropdownItem}
                            onClick={() => handleSelect(item.key)}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default DropdownMenu;
