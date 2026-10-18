import { Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useTolgee } from "@tolgee/react";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectCurrentUser } from "./redux/user/user.selectors";
import { refreshTokenStart, signOut } from "./redux/user/user.actions";

import { constantsUrls } from "./helpers/constants";

const LandingPage = lazy(() => import("./pages/landing-page/landing-page"));
const SignIn = lazy(() => import("./pages/sign-in/sign-in"));
const SignUp = lazy(() => import("./pages/sign-up/sign-up"));
const Confirm = lazy(() => import("./pages/confirm/confirm"));
const FillRegisterData = lazy(() => import("./pages/fill-register-data/fill-register-data"));
const SelectRole = lazy(() => import("./pages/select-role/select-role"));
const Materials = lazy(() => import("./pages/materials/materials"));
const EducatorsGuide = lazy(() => import("./pages/educators-guide/educators-guide"));

function App() {
    const currentUser = useAppSelector(selectCurrentUser);
    const tolgee = useTolgee(["language"]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && currentUser) {
            dispatch(refreshTokenStart());
        } else if (!token && currentUser) {
            dispatch(signOut());
        }
    }, [currentUser, dispatch]);

    return (
        <div lang={tolgee.getLanguage() || "en"}>
            <main>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path={constantsUrls.Main.materials} element={<Materials />} />
                        <Route
                            path={constantsUrls.Main.educatorsGuide}
                            element={<EducatorsGuide />}
                        />
                        <Route
                            path={constantsUrls.Main.didacticGuide}
                            element={<EducatorsGuide />}
                        />
                        <Route path={constantsUrls.LandingPage.signIn} element={<SignIn />} />
                        <Route path={constantsUrls.LandingPage.signUp} element={<SignUp />} />
                        <Route path={constantsUrls.LandingPage.confirm} element={<Confirm />} />
                        <Route
                            path={constantsUrls.LandingPage.fillRegisterData}
                            element={<FillRegisterData />}
                        />
                        <Route path="/more-info" element={<FillRegisterData />} />
                        <Route
                            path={constantsUrls.LandingPage.selectRole}
                            element={<SelectRole />}
                        />
                        <Route path="/choose-role" element={<SelectRole />} />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}

export default App;
