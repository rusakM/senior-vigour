import type { UserRole } from "../../types/user";
import { UserRoleEnum } from "../../types/user";

export const LocalesEnum = {
    en: "en",
    pl: "pl",
    el: "el",
    it: "it",
    es: "es",
    lv: "lv",
} as const;

export type LocalesEnum = (typeof LocalesEnum)[keyof typeof LocalesEnum];
export type TLocale = LocalesEnum;

export const ROLES_TRANSLATIONS: Record<UserRole, string> = {
    [UserRoleEnum.STUDENT]: "main.roles.student",
    [UserRoleEnum.TEACHER]: "main.roles.teacher",
};