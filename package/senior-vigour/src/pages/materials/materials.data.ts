import MentalHealthIcon from '../../assets/materials/materials_mental_health.svg';
import PhysicalHealthIcon from '../../assets/materials/materials_physical_health.svg';
import NutritionIcon from '../../assets/materials/materials_nutrition.svg';
import SocialInteractionsIcon from '../../assets/materials/materials_social_interactions.svg';
import EcologyIcon from '../../assets/materials/materials_ecology.svg';
import DigitalTechnologiesIcon from '../../assets/materials/materials_digital_technologies.svg';

export interface LessonPlanItem {
    id: string;
    title: string;
    description: string;
    downloadUrl?: string;
    viewUrl?: string;
}

export interface InfographicItem {
    id: string;
    title: string;
    description: string;
    downloadUrl?: string;
}

export interface LearningAreaItem {
    key: string;
    translationKey: string;
    title: string;
    materialsCount: number;
    iconSrc: string;
    handbookTitle: string;
    handbookDescription: string;
    lessonPlansSubtitleDesktop: string;
    lessonPlansSubtitleMobile: string;
    lessonPlans: LessonPlanItem[];
    infographicsTitleDesktop: string;
    infographicsTitleMobile: string;
    infographicsSubtitle: string;
    infographics: InfographicItem[];
}

export const LEARNING_AREAS_DATA: LearningAreaItem[] = [
    {
        key: 'mental-health',
        translationKey: 'mentalHealth',
        title: 'Mental health',
        materialsCount: 11,
        iconSrc: MentalHealthIcon,
        handbookTitle: 'Open the Mental Health Handbook',
        handbookDescription: 'Click this section to open the Mental Health Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions for educators, moving from myths about mental health to personal strengths, purpose and habits that last.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Mental health in later life - awareness and understanding',
                description: 'Popular myths about ageing and mental health meet the evidence, with open talk about stigma and where to find support.',
            },
            {
                id: 'lp-2',
                title: 'Your starting point - what you already bring',
                description: 'Stories of getting through hard times reveal coping strengths people never named, and age-based limits worth questioning.',
            },
            {
                id: 'lp-3',
                title: 'Understanding and managing the inner world',
                description: 'Scenario cards show that a first thought is not a fact, while a worry-sorting sheet separates what can and cannot be acted on.',
            },
            {
                id: 'lp-4',
                title: 'Purpose and identity - what you still have to give',
                description: 'Three-minute mini-lessons from every participant reveal how much the group knows and which roles each person could still take on.',
            },
            {
                id: 'lp-5',
                title: 'Making it part of your life - what happens after this course',
                description: 'Why some routines last for years while others stop, and how a small habit, a named person and a fixed day keep changes going.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Infographic 1',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
    {
        key: 'physical-health',
        translationKey: 'physicalHealth',
        title: 'Physical health',
        materialsCount: 11,
        iconSrc: PhysicalHealthIcon,
        handbookTitle: 'Open the Physical Health Handbook',
        handbookDescription: 'Click this section to open the Physical Health Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions covering regular exercise, preventive care, and active lifestyles.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Movement and vitality in everyday life',
                description: 'Discover practical and safe physical activities tailored for seniors to maintain mobility and joint health.',
            },
            {
                id: 'lp-2',
                title: 'Balance and fall prevention',
                description: 'Targeted exercises to improve stability, core strength, and confidence in navigating daily spaces safely.',
            },
            {
                id: 'lp-3',
                title: 'Cardio fitness and breathing techniques',
                description: 'Gentle aerobic routines and breathing techniques to enhance endurance and heart health.',
            },
            {
                id: 'lp-4',
                title: 'Strength and functional movement',
                description: 'Low-impact resistance training that empowers older adults to carry out routine daily tasks effortlessly.',
            },
            {
                id: 'lp-5',
                title: 'Building long-term active habits',
                description: 'Strategies for establishing realistic exercise goals and staying engaged with community fitness programs.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Infographic 1',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
    {
        key: 'nutrition',
        translationKey: 'nutrition',
        title: 'Nutrition',
        materialsCount: 11,
        iconSrc: NutritionIcon,
        handbookTitle: 'Open the Nutrition Handbook',
        handbookDescription: 'Click this section to open the Nutrition Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions exploring balanced meals, hydration, and nutritional well-being for seniors.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Fundamentals of healthy aging diets',
                description: 'Understanding macro and micronutrients that support energy, bone density, and metabolic wellness.',
            },
            {
                id: 'lp-2',
                title: 'Hydration and digestive balance',
                description: 'Practical routines for maintaining adequate fluid intake and supporting a thriving gut microbiome.',
            },
            {
                id: 'lp-3',
                title: 'Meal planning on a budget',
                description: 'Simple, nutritious recipes designed for seasonal shopping and effortless home preparation.',
            },
            {
                id: 'lp-4',
                title: 'Mindful eating and social dining',
                description: 'How shared meals and mindful food appreciation foster cognitive vitality and community connection.',
            },
            {
                id: 'lp-5',
                title: 'Sustaining healthy dietary habits',
                description: 'Overcoming common dietary challenges and tailoring meals to personal health recommendations.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Infographic 1',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
    {
        key: 'social-interactions',
        translationKey: 'socialInteractions',
        title: 'Social interactions',
        materialsCount: 11,
        iconSrc: SocialInteractionsIcon,
        handbookTitle: 'Open the Social Interactions Handbook',
        handbookDescription: 'Click this section to open the Social Interactions Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions fostering empathy, communication, and lasting social relationships.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Connecting through active listening',
                description: 'Skills in listening, emotional presence, and creating supportive conversation spaces with peers.',
            },
            {
                id: 'lp-2',
                title: 'Overcoming loneliness and isolation',
                description: 'Proven strategies for finding local clubs, peer support networks, and community volunteering.',
            },
            {
                id: 'lp-3',
                title: 'Intergenerational dialogue and storytelling',
                description: 'Bridging generational perspectives through storytelling and mutual learning experiences.',
            },
            {
                id: 'lp-4',
                title: 'Resolving everyday interpersonal conflict',
                description: 'Constructive approaches to discussing differences and preserving warm relationships.',
            },
            {
                id: 'lp-5',
                title: 'Building a lasting social circle',
                description: 'Cultivating authentic friendships and maintaining regular social activities throughout later life.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Infographic 1',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
    {
        key: 'ecology',
        translationKey: 'ecology',
        title: 'Ecology',
        materialsCount: 11,
        iconSrc: EcologyIcon,
        handbookTitle: 'Open the Ecology Handbook',
        handbookDescription: 'Click this section to open the Ecology Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions on sustainable daily choices, energy saving, and nature immersion.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Eco-friendly habits at home',
                description: 'Simple methods to conserve water, reduce energy usage, and eliminate household food waste.',
            },
            {
                id: 'lp-2',
                title: 'Waste sorting and recycling mastery',
                description: 'Clear, practical guidelines on modern recycling practices and circular economy principles.',
            },
            {
                id: 'lp-3',
                title: 'Urban gardening and green living',
                description: 'Cultivating plants, balcony gardens, and experiencing the cognitive benefits of spending time in nature.',
            },
            {
                id: 'lp-4',
                title: 'Sustainable consumer choices',
                description: 'Choosing durable goods, minimizing single-use plastics, and supporting local ethical producers.',
            },
            {
                id: 'lp-5',
                title: 'Community ecological initiatives',
                description: 'Joining local park cleanups, tree planting events, and neighborhood green projects.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Infographic 1',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
    {
        key: 'digital-technologies',
        translationKey: 'digitalTechnologies',
        title: 'Digital technologies',
        materialsCount: 11,
        iconSrc: DigitalTechnologiesIcon,
        handbookTitle: 'Open the Digital Technologies Handbook',
        handbookDescription: 'Click this section to open the Digital Technologies Handbook and discover the full collection of materials.',
        lessonPlansSubtitleDesktop: 'Five 60-minute sessions on mastering smartphones, internet safety, and useful digital services.',
        lessonPlansSubtitleMobile: 'Access a collection of educational materials, worksheets, guides, and supporting resources created to enhance learning experiences for seniors.',
        lessonPlans: [
            {
                id: 'lp-1',
                title: 'Smartphone essentials and navigation',
                description: 'Mastering touchscreen gestures, accessibility settings, and essential device configuration.',
            },
            {
                id: 'lp-2',
                title: 'Internet safety and fraud prevention',
                description: 'Spotting online scams, managing secure passwords, and browsing the web with confidence.',
            },
            {
                id: 'lp-3',
                title: 'Connecting through video and messaging apps',
                description: 'Staying close to family and friends through messaging, photo sharing, and group video calls.',
            },
            {
                id: 'lp-4',
                title: 'Public e-services and healthcare portals',
                description: 'Accessing electronic prescriptions, booking appointments, and navigating municipal services online.',
            },
            {
                id: 'lp-5',
                title: 'Exploring AI and future technologies',
                description: 'Demystifying voice assistants, Artificial Intelligence tools, and smart home helpers.',
            },
        ],
        infographicsTitleDesktop: 'Infographics',
        infographicsTitleMobile: 'Downloadable Resources',
        infographicsSubtitle: 'Clear visual summaries of key messages on mental wellbeing, made for seniors to read at their own pace or keep after a session.',
        infographics: [
            {
                id: 'info-1',
                title: 'Handbook',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-2',
                title: 'Infographic 2',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-3',
                title: 'Infographic 3',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-4',
                title: 'Infographic 4',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
            {
                id: 'info-5',
                title: 'Infographic 5',
                description: 'Welcome to the Planet Goals Project - an EU co-funded international initiative aimed at raising the awareness.',
            },
        ],
    },
];
