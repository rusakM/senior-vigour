import { type FC, useState } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../../assets/icons/black_arrow.svg';
import type { IQuestion } from '../../../../../types/poll';

import styles from './select-correct-order.module.scss';

export interface SelectCorrectOrderProps {
    question: IQuestion;
    isSubmitting?: boolean;
    onSubmitAnswer: (response: string) => void;
}

const SelectCorrectOrder: FC<SelectCorrectOrderProps> = ({
    question,
    isSubmitting = false,
    onSubmitAnswer,
}) => {
    const { t } = useTranslate();
    const answers = question.answers ?? [];

    const [selectedOrder, setSelectedOrder] = useState<Array<number | null>>(() =>
        Array(answers.length).fill(null)
    );

    const handleSelectChange = (rowIndex: number, rawValue: string) => {
        setSelectedOrder((prev) => {
            const next = [...prev];
            if (rawValue === '') {
                next[rowIndex] = null;
                return next;
            }

            const chosenIdx = Number(rawValue);
            for (let i = 0; i < next.length; i++) {
                if (i !== rowIndex && next[i] === chosenIdx) {
                    next[i] = null;
                }
            }
            next[rowIndex] = chosenIdx;
            return next;
        });
    };

    const isComplete =
        answers.length > 0 &&
        selectedOrder.length === answers.length &&
        selectedOrder.every((v) => v !== null);

    const handleNextClick = () => {
        if (!isComplete || isSubmitting) return;
        onSubmitAnswer(JSON.stringify(selectedOrder));
    };

    return (
        <div
            className={styles.questionContainer}
            data-testid="question-select-correct-order"
        >
            <h2 className={styles.questionTitle}>
                {t(question.question, question.question)}
            </h2>

            <div className={styles.rowsList}>
                {answers.map((answer, rowIndex) => {
                    const currentValue =
                        selectedOrder[rowIndex] !== null &&
                        selectedOrder[rowIndex] !== undefined
                            ? String(selectedOrder[rowIndex])
                            : '';

                    return (
                        <div
                            key={rowIndex}
                            className={styles.orderRow}
                            data-testid={`order-row-${rowIndex}`}
                        >
                            <span className={styles.rowLabel}>
                                {`${rowIndex + 1}. ${t(answer, answer)}`}
                            </span>

                            <select
                                className={styles.orderSelect}
                                value={currentValue}
                                onChange={(e) =>
                                    handleSelectChange(rowIndex, e.target.value)
                                }
                                data-testid={`order-select-${rowIndex}`}
                            >
                                <option value="">
                                    {t(
                                        'poll.selectCorrectOrder.placeholder',
                                        'Select order...'
                                    )}
                                </option>
                                {answers.map((_, orderIdx) => (
                                    <option key={orderIdx} value={orderIdx}>
                                        {orderIdx + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextClick}
                disabled={!isComplete || isSubmitting}
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

export default SelectCorrectOrder;
