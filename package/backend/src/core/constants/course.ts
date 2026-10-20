export namespace Game {
    export enum STATUS_ENUM {
        CREATED = 'CREATED',
        STARTED = 'STARTED',
        CANCELLED = 'CANCELLED',
        FINISHED = 'FINISHED',
    }
}

export namespace Module {
    export enum CATEGORY {
        DIGITAL_TECHNOLOGIES = 'DIGITAL_TECHNOLOGIES',
        ECOLOGY = 'ECOLOGY',
        MENTAL_HEALTH = 'MENTAL_HEALTH',
        NUTRITION = 'NUTRITION',
        PHYSICAL_HEALTH = 'PHYSICAL_HEALTH',
        SOCIAL_INTERACTIONS = 'SOCIAL_INTERACTIONS',
    }
}

export namespace Question {
    export enum TYPES_ENUM {
        IMG_CHOOSE = 'IMG_CHOOSE',
        MULTI_CHOOSE = 'MULTI_CHOOSE',
        SELECT_CORRECT_ORDER = 'SELECT_CORRECT_ORDER',
        SINGLE_CHOOSE = 'SINGLE_CHOOSE',
        TRUE_FALSE = 'TRUE_FALSE',
    }
}

export namespace Material {
    export enum TYPES_ENUM {
        EDUCATORS_GUIDE = 'EDUCATORS_GUIDE',
        HANDBOOK = 'HANDBOOK',
        INFOGRAPHIC = 'INFOGRAPHIC',
        LESSON_PLAN = 'LESSON_PLAN',
    };
}
