import type { FC } from 'react';
import styles from './partners-grid.module.scss';

export interface PartnerItem {
    name: string;
    logoSrc: string;
    url: string;
}

export interface PartnersGridProps {
    partners: PartnerItem[];
    additionalClasses?: string;
}

const PartnersGrid: FC<PartnersGridProps> = ({ partners, additionalClasses }) => {
    const combinedClassName = [styles.grid, additionalClasses || ''].filter(Boolean).join(' ');

    return (
        <div className={combinedClassName}>
            {partners.map((partner) => (
                <div key={partner.name} className={styles.item}>
                    <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                        title={partner.name}
                    >
                        <img src={partner.logoSrc} alt={partner.name} className={styles.logo} />
                    </a>
                </div>
            ))}
        </div>
    );
};

export default PartnersGrid;
