import type { FC, ReactNode } from 'react';
import ContentContainer from '../../components/content-container/content-container';
import styles from './page-container.module.scss';

export interface PageContainerProps {
    additionalClasses?: string;
    children: ReactNode;
}

const PageContainer: FC<PageContainerProps> = ({ additionalClasses, children }) => {
    return (
        <div className={`${styles.pageContainer}${additionalClasses ? ` ${additionalClasses}` : ''}`}>
            <ContentContainer>{children}</ContentContainer>
        </div>
    );
};

export default PageContainer;
