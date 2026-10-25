export const QuestionTypeEnum = {
    IMG_CHOOSE: 'IMG_CHOOSE',
    MULTI_CHOOSE: 'MULTI_CHOOSE',
    SELECT_CORRECT_ORDER: 'SELECT_CORRECT_ORDER',
    SINGLE_CHOOSE: 'SINGLE_CHOOSE',
    TRUE_FALSE: 'TRUE_FALSE',
} as const;

export type QuestionTypeEnum = (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];
export type QuestionType = QuestionTypeEnum;

export const QuestionCategoryEnum = {
    MENTAL_HEALTH: 'MENTAL_HEALTH',
    PHYSICAL_HEALTH: 'PHYSICAL_HEALTH',
    NUTRITION: 'NUTRITION',
    SOCIAL_INTERACTIONS: 'SOCIAL_INTERACTIONS',
    ECOLOGY: 'ECOLOGY',
    DIGITAL_TECHNOLOGIES: 'DIGITAL_TECHNOLOGIES',
} as const;

export type QuestionCategoryEnum =
    (typeof QuestionCategoryEnum)[keyof typeof QuestionCategoryEnum];
export type QuestionCategory = QuestionCategoryEnum;

export const PollStatusEnum = {
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
} as const;

export type PollStatusEnum = (typeof PollStatusEnum)[keyof typeof PollStatusEnum];
export type PollStatus = PollStatusEnum;

export interface IQuestion {
    _id?: string;
    answers?: string[];
    category: QuestionCategoryEnum;
    correctAnswer: string;
    correctAnswerIndex?: number;
    question: string;
    questionNumber: number;
    subquestions?: string[];
    type: QuestionTypeEnum;
}

export interface IPlayerAnswer {
    category?: QuestionCategoryEnum;
    correctAnswer?: string;
    points?: number;
    questionNumber: number;
    respondAt?: string;
    response?: string;
}

export interface ICategoryScore {
    category: QuestionCategoryEnum;
    points: number;
}

export interface IPlayerPoll {
    _id: string;
    answers?: IPlayerAnswer[];
    categoryScores?: ICategoryScore[];
    firstName: string;
    lastName: string;
    mentorId?: string;
    playerId: string;
    score?: number;
    status: PollStatusEnum;
    createdAt?: string;
    updatedAt?: string;
}

export interface IStartPollPayload {
    firstName?: string;
    lastName?: string;
}

export interface ISubmitAnswerPayload {
    playerPollId: string;
    questionNumber: number;
    response: string;
}
