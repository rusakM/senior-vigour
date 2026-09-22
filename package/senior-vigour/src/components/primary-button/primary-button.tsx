import type { FC, ReactNode, MouseEvent } from "react";
import styles from "./primary-button.module.scss";
import { getCurrentLocale } from "../../translations/utils";

export type TButtonColor = "grey" | "violet" | "red" | "white" | "transparent";
export type TButtonSize = "regular" | "large";
export type TButtonType = "default" | "action";

export interface PrimaryButtonProps {
    additionalClasses?: string;
    animated?: boolean;
    children: ReactNode;
    color?: TButtonColor;
    disabled?: boolean;
    gradient?: boolean;
    icon?: boolean;
    increaseHorizontalPadding?: boolean;
    onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
    rounded?: boolean;
    selected?: boolean;
    size?: TButtonSize;
    title?: string;
    type?: TButtonType;
}

const PrimaryButton: FC<PrimaryButtonProps> = ({
    additionalClasses,
    animated = false,
    children,
    color = "grey",
    disabled = false,
    gradient = false,
    icon = false,
    increaseHorizontalPadding = false,
    onClick,
    rounded = false,
    selected = false,
    size = "regular",
    title,
    type = "default",
}) => {
    const combinedClassName = [
        styles.button,
        styles[color],
        size !== "regular" ? styles[size] : "",
        selected ? styles[`selected${color}`] : "",
        rounded ? styles.circle : "",
        gradient ? styles.gradient : "",
        increaseHorizontalPadding ? styles.increasedHorizontalPadding : "",
        icon ? styles.icon : "",
        animated ? styles.animated : "",
        type !== "default" ? styles[type] : "",
        additionalClasses || "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            className={combinedClassName}
            onClick={onClick}
            disabled={disabled}
            lang={getCurrentLocale()}
            title={title}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;
