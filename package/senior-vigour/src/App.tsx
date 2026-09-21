import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTolgee } from "@tolgee/react";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectCurrentUser } from "./redux/user/user.selectors";
import { refreshTokenStart, signOut } from "./redux/user/user.actions";

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
                    <Route path="/" element={<div>Senior Vigour Platform</div>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
