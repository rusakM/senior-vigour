import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { type LearningAreaItem } from '../../materials.data';
import DocIcon from '../../../../assets/materials/Group 392.svg';
import type { IMaterial } from '../../../../types/material';
import styles from './handbook-banner.module.scss';

export interface HandbookBannerProps {
    currentArea: LearningAreaItem;
    handbook?: IMaterial | null;
    onOpenHandbook?: () => void;
}

const HandbookBanner: FC<HandbookBannerProps> = ({ currentArea, handbook, onOpenHandbook }) => {
    const { t } = useTranslate();
    const isAvailable = Boolean(handbook);

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
                    {handbook?.translation
                        ? t(handbook.translation, currentArea.handbookTitle)
                        : t(
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
                    animated={isAvailable}
                    size="large"
                    disabled={!isAvailable}
                    onClick={isAvailable ? onOpenHandbook : undefined}
                >
                    {t(
                        isAvailable
                            ? 'materials.handbook.openButton'
                            : 'materials.handbook.unavailable',
                        isAvailable ? 'Open Handbook' : 'Handbook unavailable'
                    )}
                </PrimaryButton>
            </div>
        </section>
    );
};

export default HandbookBanner;
