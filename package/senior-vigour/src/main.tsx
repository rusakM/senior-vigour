import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import tolgeeConfig from "./translations/index";

import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <BrowserRouter>
            <TolgeeProvider tolgee={tolgeeConfig} fallback={<div>Loading translations...</div>}>
                <Suspense fallback={<div>Loading application...</div>}>
                    <App />
                </Suspense>
            </TolgeeProvider>
        </BrowserRouter>
    </Provider>
);
