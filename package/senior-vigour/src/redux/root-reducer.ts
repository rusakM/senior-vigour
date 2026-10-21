import { combineReducers } from "redux";
import userReducer from "./user/user.reducer";
import materialsReducer from "./materials/materials.reducer";
import pollReducer from "./poll/poll.reducer";

const rootReducer = combineReducers({
    user: userReducer,
    materials: materialsReducer,
    poll: pollReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

