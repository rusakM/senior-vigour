import { Tolgee, DevTools, FormatSimple, BackendFetch } from "@tolgee/react";
import { FormatIcu } from "@tolgee/format-icu";
import { getCurrentLocale } from "./utils";

const tolgeeConfig = Tolgee()
    .use(DevTools())
    .use(BackendFetch({ prefix: `cdn/translations` }))
    .use(FormatSimple())
    .use(FormatIcu())
    .init({
        language: getCurrentLocale() || "en",
        apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL || "https://translations.seniorvigour-platform.eu/",
        apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    });

export default tolgeeConfig;
