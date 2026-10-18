import { combineReducers } from "redux";
import userReducer from "./user/user.reducer";
import materialsReducer from "./materials/materials.reducer";

const rootReducer = combineReducers({
    user: userReducer,
    materials: materialsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
