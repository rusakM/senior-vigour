import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { type LearningAreaItem } from '../../materials.data';
import DocIcon from '../../../../assets/materials/Group 392.svg';
import styles from './handbook-banner.module.scss';

export interface HandbookBannerProps {
    currentArea: LearningAreaItem;
    onOpenHandbook?: () => void;
}

const HandbookBanner: FC<HandbookBannerProps> = ({ currentArea, onOpenHandbook }) => {
    const { t } = useTranslate();
    const isMobile = useMobile();

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
                        `materials.area.${currentArea.key}.handbookTitle`,
                        isMobile
                            ? `Mental ${currentArea.title}`
                            : currentArea.handbookTitle
                    )}
                </h2>
                <p className={styles.handbookDescription}>
                    {t(
                        `materials.area.${currentArea.key}.handbookDesc`,
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
                    {t('materials.button.openHandbook', 'Open Handbook')}
                </PrimaryButton>
            </div>
        </section>
    );
};

export default HandbookBanner;
