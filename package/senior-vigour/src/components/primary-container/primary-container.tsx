import type { FC, ReactNode, ElementType } from 'react';
import styles from './primary-container.module.scss';

export type TContainersDirection = 'row' | 'rowReverse' | 'column' | 'columnReverse';
export type TAlignment = 'center' | 'left' | 'right' | 'between' | 'around';
export type TJustifyAlignment = 'center' | 'left' | 'right';

export interface PrimaryContainerProps {
    children: ReactNode;
    as?: ElementType;
    height?: 'allScreenHeight' | 'auto';
    contentAlignment?: TAlignment;
    contentJustify?: TJustifyAlignment;
    direction?: TContainersDirection;
    width?: 'all' | 'desktopFit';
    additionalClasses?: string;
}

const PrimaryContainer: FC<PrimaryContainerProps> = ({
    children,
    as: Component = 'div',
    contentAlignment = 'center',
    contentJustify = 'center',
    height = 'auto',
    direction = 'row',
    width = 'all',
    additionalClasses,
}) => {
    const combinedClassName = [
        styles.container,
        styles[direction],
        styles[contentAlignment],
        styles[`justify${contentJustify}`],
        height === 'allScreenHeight' ? styles.allScreenHeight : '',
        width === 'desktopFit' ? styles.desktopFit : '',
        additionalClasses || '',
    ]
        .filter(Boolean)
        .join(' ');

    return <Component className={combinedClassName}>{children}</Component>;
};

export default PrimaryContainer;
