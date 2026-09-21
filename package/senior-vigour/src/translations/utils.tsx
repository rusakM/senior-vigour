import React from "react";

export const getCurrentLocale = (): string => localStorage.getItem("locale") || "en";

export const formatNewLines = (text: string) => (
    <>
        {text.split("<br>").map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ))}
    </>
);

export const parseBoldTags = (text: string, additionalClassess?: string) => (
    <>
        {text.split(/<b>|<\/b>/g).map((part, index) => (
            <React.Fragment key={index}>
                {index % 2 === 1 ? <strong className={additionalClassess || ""} lang={getCurrentLocale()}>{part}</strong> : part}
            </React.Fragment>
        ))}
    </>
);
