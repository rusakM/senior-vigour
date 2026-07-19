import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from '.';
import { ConstantsCourse } from '../core/constants';

interface IQuestionMedia {
    name?: string;
    url?: string;
    type?: ConstantsCourse.Question.QUESTION_MEDIA_TYPES_ENUM;
}

export interface IQuestion {
    answers?: string[];
    correctAnswer?: string;
    correctAnswerIndex?: number;
    description?: string;
    maxPoints?: number;
    media?: IQuestionMedia[];
    question?: string;
    type?: ConstantsCourse.Question.TYPES_ENUM;
}

export interface IModule {
    questions?: IQuestion[];
    moduleNumber?: number;
    moduleNameTranslation?: string;
}

interface IBibliography {
    title?: string;
    url?: string;
}

interface ICourseBasic {
    bibliography?: IBibliography[];
    courseNumber?: number;
    modules?: IModule[];
    name?: string;
    nameTranslation?: string;
}

export interface ICourse extends ICourseBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBCourse extends ICourseBasic, Document {}

const CourseSchema = new Schema<IDBCourse>(
    {
        bibliography: [
            {
                title: String,
                url: String,
            },
        ],
        courseNumber: {
            type: Number,
            unique: true,
        },
        modules: [
            {
                questions: [
                    {
                        answers: [
                            {
                                type: String,
                            },
                        ],
                        correctAnswer: String,
                        correctAnswerIndex: {
                            type: Number,
                            min: 0,
                        },
                        description: String,
                        maxPoints: {
                            type: Number,
                            min: 0,
                        },
                        gameStage: {
                            type: String,
                            enum: Object.values(ConstantsCourse.Game.STAGE_ENUM),
                        },
                        question: String,
                        type: {
                            type: String,
                            enum: Object.keys(ConstantsCourse.Game.STAGE_ENUM),
                        },
                    },
                ],
                moduleNumber: Number,
                moduleNameTranslation: String,
            },
        ],
        name: String,
        nameTranslation: String,
    },
    SchemasGlobal.Options.dbSchema
);

export type TIndexes = 'courseNumber';

export const Course = model<IDBCourse>(Helper.prepareTableName('course'), CourseSchema);
