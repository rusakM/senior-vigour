import { type FC, useState } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../../assets/icons/black_arrow.svg';
import type { IQuestion } from '../../../../../types/poll';

import styles from './single-choose.module.scss';

export interface SingleChooseProps {
    question: IQuestion;
    isSubmitting?: boolean;
    onSubmitAnswer: (response: string) => void;
}

const SingleChoose: FC<SingleChooseProps> = ({
    question,
    isSubmitting = false,
    onSubmitAnswer,
}) => {
    const { t } = useTranslate();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const answers = question.answers ?? [];

    const handleNextClick = () => {
        if (selectedIndex === null || isSubmitting) return;
        onSubmitAnswer(String(selectedIndex));
    };

    return (
        <div className={styles.questionContainer} data-testid="question-single-choose">
            <h2 className={styles.questionTitle}>
                {t(question.question, question.question)}
            </h2>

            <div className={styles.optionsGrid}>
                {answers.map((answer, index) => {
                    const isSelected = selectedIndex === index;
                    const letter = String.fromCharCode(65 + index);

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.optionCard} ${
                                isSelected ? styles.optionCardSelected : ''
                            }`}
                            onClick={() => setSelectedIndex(index)}
                            aria-pressed={isSelected}
                            data-testid={`poll-option-${index}`}
                        >
                            <span className={styles.optionLetter}>{letter}</span>
                            <span className={styles.optionText}>
                                {t(answer, answer)}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextClick}
                disabled={selectedIndex === null || isSubmitting}
                data-testid="poll-next-button"
            >
                <span>{t('poll.nextQuestion', 'Next question')}</span>
                <img
                    src={BlackArrowIcon}
                    alt=""
                    aria-hidden="true"
                    className={styles.arrowIcon}
                />
            </button>
        </div>
    );
};

export default SingleChoose;
