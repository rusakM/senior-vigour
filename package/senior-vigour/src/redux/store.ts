import { configureStore } from "@reduxjs/toolkit";
import { rememberReducer, rememberEnhancer } from "redux-remember";
import createSagaMiddleware from "redux-saga";
import { createLogger } from "redux-logger";

import type { Middleware } from "redux";
import rootReducer from "./root-reducer";
import rootSaga from "./root-saga";

const sagaMiddleware = createSagaMiddleware();
const rememberedKeysLocalStorage = ["user"];

const logger = createLogger({
    collapsed: true,
    diff: true,
});

export const store = configureStore({
    reducer: rememberReducer(rootReducer),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
            sagaMiddleware,
            ...(import.meta.env.DEV ? [logger as unknown as Middleware] : [])
        ),
    enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers().concat(
            rememberEnhancer(window.localStorage, rememberedKeysLocalStorage)
        ),
    devTools: import.meta.env.DEV,
});

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export default store;
