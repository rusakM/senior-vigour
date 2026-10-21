import { QuestionCategoryEnum } from '../../types/poll';

export const POLL_CATEGORY_TRANSLATION_MAP: Record<
    QuestionCategoryEnum,
    { key: string; defaultText: string }
> = {
    [QuestionCategoryEnum.MENTAL_HEALTH]: {
        key: 'poll.category.mentalHealth',
        defaultText: 'Mental health',
    },
    [QuestionCategoryEnum.PHYSICAL_HEALTH]: {
        key: 'poll.category.physicalHealth',
        defaultText: 'Physical health',
    },
    [QuestionCategoryEnum.NUTRITION]: {
        key: 'poll.category.nutrition',
        defaultText: 'Nutrition',
    },
    [QuestionCategoryEnum.SOCIAL_INTERACTIONS]: {
        key: 'poll.category.socialInteractions',
        defaultText: 'Social interactions',
    },
    [QuestionCategoryEnum.ECOLOGY]: {
        key: 'poll.category.ecology',
        defaultText: 'Ecology',
    },
    [QuestionCategoryEnum.DIGITAL_TECHNOLOGIES]: {
        key: 'poll.category.digitalTechnologies',
        defaultText: 'Digital technologies',
    },
};
