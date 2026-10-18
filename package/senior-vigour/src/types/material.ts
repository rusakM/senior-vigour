import type { TLocale } from '../helpers/constants';

export const MaterialTypeEnum = {
    EDUCATORS_GUIDE: 'EDUCATORS_GUIDE',
    HANDBOOK: 'HANDBOOK',
    INFOGRAPHIC: 'INFOGRAPHIC',
    LESSON_PLAN: 'LESSON_PLAN',
} as const;

export type MaterialTypeEnum = (typeof MaterialTypeEnum)[keyof typeof MaterialTypeEnum];
export type MaterialType = MaterialTypeEnum;

export interface IMaterialLanguage {
    fileExtension: string;
    name: string;
    pages: number;
}

export interface IMaterial {
    _id?: string;
    category: string;
    languages: Partial<Record<TLocale, IMaterialLanguage>> & Record<string, IMaterialLanguage>;
    name: string;
    translation: string;
    type: MaterialType;
}
