export const Footer = {
    conditionTerms: "/cdn/assets/SeniorVigour_Terms_of_Service.pdf",
    facebook: "https://www.facebook.com/profile.php?id=61582492078947",
    linkedIn: "https://www.linkedin.com/company/110849964",
    privacyPolicy: "/cdn/assets/SeniorVigour_Privacy_Policy.pdf",
    youtube: "https://www.youtube.com",
} as const;

export const LandingPage = {
    blog: "https://seniorvigour.eu/",
    confirm: "/confirm",
    fillRegisterData: "/signup-finish",
    main: "/",
    selectRole: "/select-role",
    signIn: "/signin",
    signUp: "/signup",
} as const;

export const Main = {
    diagnosticResults: "/diagnostic-results",
    diagnosticTest: "/diagnostic-test",
    didacticGuide: "/didactic-guide",
    educatorView: "/educator",
    educatorsGuide: "/educators-guide",
    materials: "/materials",
    myProfile: "/my-profile",
    pollResults: "/diagnostic-results/:playerPollId",
    seniorView: "/senior",
} as const;

export const Partners = {
    acufade: "https://www.acufade.org/",
    euroLider: "https://euro-lider.eu/",
    innoved: "https://www.innoved.gr/",
    lovila: "https://lovila.eu/",
    novareckon: "https://www.novareckon.it/en/",
    projectNet: "https://projectfund.net/",
} as const;

export const Materials = {
    cdnMaterials: "/cdn/materials",
    getByCategory: "/api/materials",
} as const;

export const Poll = {
    questions: "/api/poll/questions",
    question: "/api/poll/question",
    start: "/api/poll/start",
    playerPolls: "/api/poll/player",
    pollById: "/api/poll",
} as const;

export const User = {
    checkEmail: "/api/user/auth/login",
    confirm: "/api/user/auth/confirm",
    edit: "/api/user/auth/edit",
    me: "/api/user/auth/me",
    refreshToken: "/api/user/auth/refresh-token",
    signUp: "/api/user/auth/register",
    stats: "/api/user/stats",
} as const;

export const constantsUrls = {
    Footer,
    LandingPage,
    Main,
    Materials,
    Partners,
    Poll,
    User,
} as const;

