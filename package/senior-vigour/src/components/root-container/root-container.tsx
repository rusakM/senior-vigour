import type { FC } from 'react';
import styles from './root-container.module.scss';
import type { IComponentWithChildren } from '../../types/components';

const RootContainer: FC<IComponentWithChildren> = ({ children, additionalClasses }) => (
    <div className={`${styles.container}${additionalClasses ? ` ${additionalClasses}` : ''}`}>
        <div className={styles.viewer}>{children}</div>
    </div>
);

export default RootContainer;
