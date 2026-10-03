import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTolgee } from "@tolgee/react";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectCurrentUser } from "./redux/user/user.selectors";
import { refreshTokenStart, signOut } from "./redux/user/user.actions";



import { constantsUrls } from "./helpers/constants";
import LandingPage from "./pages/landing-page/landing-page";
import SignIn from "./pages/sign-in/sign-in";
import SignUp from "./pages/sign-up/sign-up";

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
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path={constantsUrls.LandingPage.signIn} element={<SignIn />} />
                    <Route path={constantsUrls.LandingPage.signUp} element={<SignUp />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
