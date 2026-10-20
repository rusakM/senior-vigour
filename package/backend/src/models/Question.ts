import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from '.';
import { ConstantsCourse } from '../core/constants';

export interface IQuestionBasic {
    answers?: string[];
    category: ConstantsCourse.Module.CATEGORY;
    correctAnswer: string;
    correctAnswerIndex?: number;
    description?: string;
    question: string;
    questionNumber: number;
    type: ConstantsCourse.Question.TYPES_ENUM;
}

export interface IQuestion extends IQuestionBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBQuestion extends IQuestionBasic, Document {}

const QuestionSchema = new Schema<IDBQuestion>(
    {
        answers: [
            {
                type: String,
            },
        ],
        category: {
            type: String,
            required: true,
            enum: Object.values(ConstantsCourse.Module.CATEGORY),
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        correctAnswerIndex: {
            type: Number,
            min: 0,
        },
        description: {
            type: String,
        },
        question: {
            type: String,
            required: true,
        },
        questionNumber: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(ConstantsCourse.Question.TYPES_ENUM),
        },
    },
    SchemasGlobal.Options.dbSchema
);

QuestionSchema.index({ questionNumber: 1 }, { unique: true });
QuestionSchema.index({ category: 1 });

export type TIndexes = 'questionNumber' | 'category';

export const Question = model<IDBQuestion>(Helper.prepareTableName('question'), QuestionSchema);
