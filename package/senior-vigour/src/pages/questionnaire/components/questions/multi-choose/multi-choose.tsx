import { type FC, useState } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../../assets/icons/black_arrow.svg';
import type { IQuestion } from '../../../../../types/poll';

import styles from './multi-choose.module.scss';

export interface MultiChooseProps {
    question: IQuestion;
    isSubmitting?: boolean;
    onSubmitAnswer: (response: string) => void;
}

const MultiChoose: FC<MultiChooseProps> = ({
    question,
    isSubmitting = false,
    onSubmitAnswer,
}) => {
    const { t } = useTranslate();
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const answers = question.answers ?? [];

    const handleToggleIndex = (index: number) => {
        setSelectedIndices((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleNextClick = () => {
        if (selectedIndices.length === 0 || isSubmitting) return;
        const sorted = [...selectedIndices].sort((a, b) => a - b);
        onSubmitAnswer(JSON.stringify(sorted));
    };

    return (
        <div className={styles.questionContainer} data-testid="question-multi-choose">
            <h2 className={styles.questionTitle}>
                {t(question.question, question.question)}
            </h2>

            <div className={styles.optionsGrid}>
                {answers.map((answer, index) => {
                    const isSelected = selectedIndices.includes(index);
                    const letter = String.fromCharCode(65 + index);

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.optionCard} ${
                                isSelected ? styles.optionCardSelected : ''
                            }`}
                            onClick={() => handleToggleIndex(index)}
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
                disabled={selectedIndices.length === 0 || isSubmitting}
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

export default MultiChoose;
