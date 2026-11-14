import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import tolgeeConfig from "./translations/index";

import { AccessibilityProvider } from "./context/accessibility-context";
import "./styles/a11y-themes.scss";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <BrowserRouter>
            <TolgeeProvider tolgee={tolgeeConfig} fallback={<div>Loading translations...</div>}>
                <AccessibilityProvider>
                    <Suspense fallback={<div>Loading application...</div>}>
                        <App />
                    </Suspense>
                </AccessibilityProvider>
            </TolgeeProvider>
        </BrowserRouter>
    </Provider>
);
