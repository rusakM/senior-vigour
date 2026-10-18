import type { UserRole } from "../../types/user";
import { UserRoleEnum } from "../../types/user";

export const LocalesEnum = {
    el: "el",
    en: "en",
    es: "es",
    it: "it",
    lv: "lv",
    pl: "pl",
} as const;

export type LocalesEnum = (typeof LocalesEnum)[keyof typeof LocalesEnum];
export type TLocale = LocalesEnum;

export const ROLES_TRANSLATIONS: Record<UserRole, string> = {
    [UserRoleEnum.SENIOR]: "main.roles.senior",
    [UserRoleEnum.MENTOR]: "main.roles.mentor",
};