import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from '.';
import { ConstantsCourse } from '../core/constants';

export interface IQuestionScore {
    correctAnswer?: string;
    module?: number;
    points?: number;
    question?: number;
    respondAt?: string;
    response?: string;
}

interface IModuleStats {
    module?: number;
    status?: ConstantsCourse.Module.STATUS_ENUM;
}

interface IPlayerCourseBasic {
    isFinished?: boolean;
    courseId?: string;
    modulesStats?: IModuleStats[];
    playerId?: string;
    questionScores?: IQuestionScore[];
    score?: number;
}

export interface IPlayerCourse extends IPlayerCourseBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBPlayerCourse extends IPlayerCourseBasic, Document {}

const PlayerCourseSchema = new Schema<IDBPlayerCourse>(
    {
        isFinished: {
            type: Boolean,
            default: false,
        },
        courseId: {
            type: String,
            required: true,
        },
        modulesStats: [
            {
                module: {
                    type: Number,
                    min: 0,
                },
                status: {
                    type: String,
                    enum: Object.values(ConstantsCourse.Module.STATUS_ENUM),
                },
            },
        ],
        playerId: {
            type: String,
            required: true,
        },
        questionScores: [
            {
                correctAnswer: String,
                module: Number,
                points: {
                    type: Number,
                    default: 0,
                },
                question: Number,
                respondAt: String,
                response: String,
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
    },
    SchemasGlobal.Options.dbSchema
);

PlayerCourseSchema.index({ courseId: 1 });
PlayerCourseSchema.index({ playerId: 1 });

export type TIndexes = 'courseId' | 'playerId';

export const PlayerCourse = model<IDBPlayerCourse>(Helper.prepareTableName('player-course'), PlayerCourseSchema);
