import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { type LearningAreaItem } from '../../materials.data';
import DocIcon from '../../../../assets/materials/Group 392.svg';
import styles from './handbook-banner.module.scss';

export interface HandbookBannerProps {
    currentArea: LearningAreaItem;
    onOpenHandbook?: () => void;
}

const HandbookBanner: FC<HandbookBannerProps> = ({ currentArea, onOpenHandbook }) => {
    const { t } = useTranslate();

    return (
        <section className={styles.handbookBanner} aria-label="Handbook">
            <div className={styles.handbookIconBox}>
                <img
                    src={DocIcon}
                    alt=""
                    className={styles.handbookIcon}
                    role="presentation"
                />
            </div>
            <div className={styles.handbookContent}>
                <h2 className={styles.handbookTitle}>
                    {t(
                        `materials.handbook.${currentArea.translationKey}.title`,
                        currentArea.handbookTitle
                    )}
                </h2>
                <p className={styles.handbookDescription}>
                    {t(
                        `materials.handbook.${currentArea.translationKey}.desc`,
                        currentArea.handbookDescription
                    )}
                </p>
            </div>
            <div className={styles.handbookButtonWrapper}>
                <PrimaryButton
                    color="violet"
                    rounded
                    animated
                    size="large"
                    onClick={onOpenHandbook}
                >
                    {t('materials.handbook.openButton', 'Open Handbook')}
                </PrimaryButton>
            </div>
        </section>
    );
};

export default HandbookBanner;
