import { type FC, useState } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../../assets/icons/black_arrow.svg';
import type { IQuestion } from '../../../../../types/poll';

import styles from './img-choose.module.scss';

export interface ImgChooseProps {
    question: IQuestion;
    isSubmitting?: boolean;
    onSubmitAnswer: (response: string) => void;
}

const isImagePath = (value: string): boolean => {
    const trimmed = value.trim();
    return (
        trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        /\.(svg|png|jpe?g|webp)$/i.test(trimmed)
    );
};

const ImgChoose: FC<ImgChooseProps> = ({
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
        <div className={styles.questionContainer} data-testid="question-img-choose">
            <h2 className={styles.questionTitle}>
                {t(question.question, question.question)}
            </h2>

            <div className={styles.optionsGrid}>
                {answers.map((answer, index) => {
                    const isSelected = selectedIndex === index;
                    const isOdd = index % 2 === 1;
                    const letter = String.fromCharCode(65 + index);
                    const translatedAnswer = t(answer, answer);

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.optionCard} ${
                                isOdd ? styles.optionCardOdd : ''
                            }`}
                            onClick={() => setSelectedIndex(index)}
                            aria-pressed={isSelected}
                            data-testid={`poll-option-${index}`}
                        >
                            <span
                                className={`${styles.letterStrip} ${
                                    isOdd ? styles.letterStripOdd : ''
                                } ${isSelected ? styles.letterStripSelected : ''}`}
                                data-testid={`poll-option-letter-${index}`}
                            >
                                {letter}
                            </span>

                            <div className={styles.imageArea}>
                                {isImagePath(answer) ? (
                                    <img
                                        src={answer}
                                        alt={translatedAnswer}
                                        className={styles.optionImage}
                                    />
                                ) : (
                                    <span className={styles.optionCaption}>
                                        {translatedAnswer}
                                    </span>
                                )}
                            </div>
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

export default ImgChoose;
