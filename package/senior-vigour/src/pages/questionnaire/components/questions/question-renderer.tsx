import type { FC } from 'react';
import { type IQuestion, QuestionTypeEnum } from '../../../../types/poll';

import SingleChoose from './single-choose/single-choose';
import MultiChoose from './multi-choose/multi-choose';
import TrueFalse from './true-false/true-false';
import ImgChoose from './img-choose/img-choose';
import SelectCorrectOrder from './select-correct-order/select-correct-order';

export interface QuestionRendererProps {
    question: IQuestion;
    isSubmitting?: boolean;
    onSubmitAnswer: (response: string) => void;
}

const QuestionRenderer: FC<QuestionRendererProps> = ({
    question,
    isSubmitting = false,
    onSubmitAnswer,
}) => {
    switch (question.type) {
        case QuestionTypeEnum.SINGLE_CHOOSE:
            return (
                <SingleChoose
                    key={question.questionNumber}
                    question={question}
                    isSubmitting={isSubmitting}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );
        case QuestionTypeEnum.MULTI_CHOOSE:
            return (
                <MultiChoose
                    key={question.questionNumber}
                    question={question}
                    isSubmitting={isSubmitting}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );
        case QuestionTypeEnum.TRUE_FALSE:
            return (
                <TrueFalse
                    key={question.questionNumber}
                    question={question}
                    isSubmitting={isSubmitting}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );
        case QuestionTypeEnum.IMG_CHOOSE:
            return (
                <ImgChoose
                    key={question.questionNumber}
                    question={question}
                    isSubmitting={isSubmitting}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );
        case QuestionTypeEnum.SELECT_CORRECT_ORDER:
            return (
                <SelectCorrectOrder
                    key={question.questionNumber}
                    question={question}
                    isSubmitting={isSubmitting}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );
        default:
            return null;
    }
};

export default QuestionRenderer;
