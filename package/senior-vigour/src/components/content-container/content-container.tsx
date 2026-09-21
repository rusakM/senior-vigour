import type { FC } from 'react';
import styles from './content-container.module.scss';
import type { IComponentWithChildren } from '../../types/components';

const ContentContainer: FC<IComponentWithChildren> = ({ children, additionalClasses }) => {
    return (
        <div className={`${styles.contentContainer}${additionalClasses ? ` ${additionalClasses}` : ''}`}>
            {children}
        </div>
    );
};

export default ContentContainer;
