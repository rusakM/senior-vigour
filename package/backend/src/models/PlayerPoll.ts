import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from '.';
import { ConstantsCourse, ConstantsGlobal } from '../core/constants';

export interface IPlayerAnswer {
    category?: ConstantsCourse.Module.CATEGORY;
    correctAnswer?: string;
    points?: number;
    questionNumber: number;
    respondAt?: string;
    response?: string;
}

export interface ICategoryScore {
    category: ConstantsCourse.Module.CATEGORY;
    points: number;
}

export interface IPlayerPollBasic {
    answers?: IPlayerAnswer[];
    categoryScores?: ICategoryScore[];
    firstName: string;
    lastName: string;
    mentorId?: string;
    playerId: string;
    score?: number;
    status: ConstantsCourse.Game.STATUS_ENUM;
}

export interface IPlayerPoll extends IPlayerPollBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBPlayerPoll extends IPlayerPollBasic, Document {}

const PlayerPollSchema = new Schema<IDBPlayerPoll>(
    {
        answers: [
            {
                category: {
                    type: String,
                    enum: Object.values(ConstantsCourse.Module.CATEGORY),
                },
                correctAnswer: String,
                points: {
                    type: Number,
                    default: 0,
                },
                questionNumber: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                respondAt: String,
                response: String,
            },
        ],
        categoryScores: [
            {
                category: {
                    type: String,
                    required: true,
                    enum: Object.values(ConstantsCourse.Module.CATEGORY),
                },
                points: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
            },
        ],
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        mentorId: {
            type: String,
        },
        playerId: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(ConstantsCourse.Game.STATUS_ENUM),
            default: ConstantsCourse.Game.STATUS_ENUM.STARTED,
        },
    },
    SchemasGlobal.Options.dbSchema
);

PlayerPollSchema.index({ playerId: 1 });
PlayerPollSchema.index({ mentorId: 1 });
PlayerPollSchema.index({ status: 1 });

export type TIndexes = 'playerId' | 'mentorId' | 'status';

export const PlayerPoll = model<IDBPlayerPoll>(
    Helper.prepareTableName('player-poll'),
    PlayerPollSchema
);

export interface StartPollDTO {
    firstName?: string;
    lastName?: string;
    playerId: string;
    role: ConstantsGlobal.Account.ROLES_ENUM;
}

export interface ProcessAnswerDTO {
    playerId: string;
    playerPollId: string;
    questionNumber: number;
    respondAt: string;
    response?: string;
}
