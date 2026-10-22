import { QuestionCategoryEnum } from '../../types/poll';

import SummaryMentalHealthIcon from '../../assets/senor details and results/summary_mental_health.svg';
import SummaryPhysicalHealthIcon from '../../assets/senor details and results/summary_physical_health.svg';
import SummaryNutritionIcon from '../../assets/senor details and results/summary_nutrition.svg';
import SummarySocialInteractionsIcon from '../../assets/senor details and results/summary_social_interactions.svg';
import SummaryEcologyIcon from '../../assets/senor details and results/summary_ecology.svg';
import SummaryDigitalTechnologiesIcon from '../../assets/senor details and results/summary_digital_technologies.svg';

export const CompetenceLevelEnum = {
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    GOOD: 'GOOD',
} as const;

export type CompetenceLevelEnum =
    (typeof CompetenceLevelEnum)[keyof typeof CompetenceLevelEnum];

export const getCompetenceLevel = (scoreOutOf10: number): CompetenceLevelEnum => {
    if (scoreOutOf10 <= 3) {
        return CompetenceLevelEnum.LOW;
    }
    if (scoreOutOf10 <= 7) {
        return CompetenceLevelEnum.MODERATE;
    }
    return CompetenceLevelEnum.GOOD;
};

export interface IDiagnosticCategoryConfig {
    category: QuestionCategoryEnum;
    categoryKey: string;
    titleKey: string;
    defaultTitle: string;
    icon: string;
    feedback: Record<
        CompetenceLevelEnum,
        {
            key: string;
            defaultText: string;
        }
    >;
}

export const DIAGNOSTIC_CATEGORIES_CONFIG: IDiagnosticCategoryConfig[] = [
    {
        category: QuestionCategoryEnum.MENTAL_HEALTH,
        categoryKey: 'mental-health',
        titleKey: 'poll.category.mentalHealth',
        defaultTitle: 'Mental health',
        icon: SummaryMentalHealthIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.mentalHealth.low',
                defaultText:
                    'Your responses suggest that mental health may be new for you or less familiar at the moment. This is a positive starting point. Choosing the correct response in a stressful situation depends strongly on the level of knowledge and awareness of mechanisms governing our body’s reaction to a given stressor. The Mental Health learning module has been specifically designed to assist you in the development of the fundamental understanding of mental resilience, enabling you to lay building blocks for the further enhancement of these competences. Basic terminology, awareness of the essential coping mechanisms, easy-to-implement techniques - you will find all that and more in the dedicated learning module.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.mentalHealth.moderate',
                defaultText:
                    'Your results indicate a solid foundation in the area of mental health. You clearly possess the basic understanding of such areas as mental resilience, emotional health, and coping strategies. The Mental Health learning module can help you build on this foundation, clarify key points, and further support the practical use of these skills in everyday situations. The effectiveness of addressing complex situations requiring mental resilience and stress mitigation methods depends strongly on the ability to perceive and answer to the situation as a whole, in a holistic way. Therefore, we recommend focusing on the existing room for improvement, and filling the knowledge gaps, thus equipping yourself with the tools necessary to operate effectively in modern, stress-heavy environments.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.mentalHealth.good',
                defaultText:
                    'Your responses indicate a strong and well-developed understanding of mental health. The Mental Health learning module offers opportunities to deepen your knowledge, reflect on experience, and further develop your skills. Through getting familiar with the learning content, you will be able to transfer the theoretical knowledge into the real-world applications more easily, thanks to strong understanding and repeated self-reflection sessions. Your deep knowledge might also indicate that the area of mental health is one of your interests. In this case, we hope that you will perceive the information about the specific ideas, techniques, methods and approaches included in the course, as a starting point for further, individual exploration.',
            },
        },
    },
    {
        category: QuestionCategoryEnum.PHYSICAL_HEALTH,
        categoryKey: 'physical-health',
        titleKey: 'poll.category.physicalHealth',
        defaultTitle: 'Physical health',
        icon: SummaryPhysicalHealthIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.physicalHealth.low',
                defaultText:
                    'Your responses suggest that physical health and active ageing may be new for you or less familiar at the moment. This is a positive starting point. Maintaining independence and well-being in later life depends strongly on our understanding of how regular movement, strength training, balance exercises, and healthy daily habits support the body and mind. The Physical Health learning module has been specifically designed to help you develop a fundamental understanding of safe and effective exercise, fall prevention, and cognitive fitness. You will find clear explanations, practical examples, and simple routines that can be gradually integrated into your daily life. This module will help you build confidence and establish the foundations for a healthier and more active lifestyle at your own pace.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.physicalHealth.moderate',
                defaultText:
                    'Your results indicate a solid foundation in the area of physical health. You demonstrate a basic understanding of the importance of regular movement, strength, balance, and healthy habits in maintaining long-term well-being. The Physical Health learning module can help you build on this foundation, clarify more advanced concepts such as progressive training, fall prevention strategies, and the connection between physical and cognitive fitness. Effective healthy ageing requires a holistic approach — combining aerobic activity, muscle strengthening, balance training, and intellectual stimulation. We therefore recommend focusing on strengthening specific areas where there may still be room for improvement, equipping you with practical tools to maintain independence and vitality.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.physicalHealth.good',
                defaultText:
                    'Your responses indicate a strong and well-developed understanding of physical health and healthy ageing principles. You show awareness of the importance of balanced weekly routines, strength training, cardiovascular fitness, and the interaction between physical and intellectual well-being. The Physical Health learning module offers opportunities to deepen your existing knowledge, refine your routines, and further develop safe and effective exercise strategies. With such a solid theoretical base, you will be well-positioned to apply evidence-based recommendations in real-life situations. Your high score may indicate that maintaining physical fitness is already an important priority for you. We hope the module will serve as an inspiring resource for further personal development and long-term active ageing.',
            },
        },
    },
    {
        category: QuestionCategoryEnum.NUTRITION,
        categoryKey: 'nutrition',
        titleKey: 'poll.category.nutrition',
        defaultTitle: 'Nutrition',
        icon: SummaryNutritionIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.nutrition.low',
                defaultText:
                    'Your responses suggest that healthy nutrition may be new for you or less familiar now. This is a positive starting point. Good health and nutrition depend strongly on our level of knowledge about how daily actions like regular meals, and enough protein, impact your wellbeing. The Nutrition module has been specifically designed to assist you in developing a fundamental understanding of healthy nutrition habits. You will find clear explanations of basic terminology, simple dietary rules, and easy-to-implement healthy nutrition techniques. This module will help you build your confidence and boost practical actions for a more sustainable lifestyle at your own pace.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.nutrition.moderate',
                defaultText:
                    'Your results indicate a solid foundation in the area of nutrition. You clearly possess a basic understanding of key topics such regular meals, and enough protein impact on your wellbeing. The Nutrition learning module can help you build on this foundation, clarify more complex points, and further support the practical use of these healthy nutrition habits in your everyday life. Being effective in healthy lifestyle often requires a holistic approach—seeing how all our small changes, from enough protein every meal to more colorful food, work together. Therefore, we recommend focusing on filling your remaining knowledge gaps, equipping you with the tools necessary to live healthier in a modern world.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.nutrition.good',
                defaultText:
                    'Your responses indicate a strong and well-developed understanding of nutrition and healthy eating habits. You are well-aware of your individual dietary habits and needed changes. The Nutrition learning module offers opportunities to deepen your existing knowledge, reflect on your long-term experiences, and further develop your practical skills. With such a strong theoretical base, you will find it easy to transfer these ideas into real-world applications. Your deep knowledge may indicate that nutrition and healthy food is a subject close to your heart. We hope that the specific techniques and dietary approaches included in this course will serve as an inspiring starting point for your further, individual exploration.',
            },
        },
    },
    {
        category: QuestionCategoryEnum.SOCIAL_INTERACTIONS,
        categoryKey: 'social-interactions',
        titleKey: 'poll.category.socialInteractions',
        defaultTitle: 'Social interactions',
        icon: SummarySocialInteractionsIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.socialInteractions.low',
                defaultText:
                    'Your responses suggest that the nuances of Social Interactions may be a relatively new area of focus for you. This is a valuable starting point on your learning journey. The training module is meticulously designed to act as your foundational guide, providing clear, step-by-step explanations and relatable practical examples. By engaging with this content, you will begin to decode social cues and build the necessary confidence to navigate interpersonal dynamics more effectively and at your own comfortable pace.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.socialInteractions.moderate',
                defaultText:
                    'Your results demonstrate a functional and solid understanding of Social Interactions. You have already mastered several key concepts, which provides a strong base to build upon. The training module will now focus on helping you bridge the gap between theory and practice. We will explore the finer details of non-verbal communication and situational awareness, providing you with the tools to clarify complex social exchanges and apply these essential skills with greater precision in your daily professional and personal life.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.socialInteractions.good',
                defaultText:
                    'Your high score reflects a sophisticated and well-developed mastery of Social Interactions. You possess a keen eye for social dynamics and an impressive ability to interpret interpersonal signals. To further your development, the training module offers advanced opportunities to deepen your existing expertise and engage in critical reflection on your social experiences. This stage is about fine-tuning your natural abilities and polishing your high-level interpersonal skills to achieve true excellence in communication and leadership.',
            },
        },
    },
    {
        category: QuestionCategoryEnum.ECOLOGY,
        categoryKey: 'ecology',
        titleKey: 'poll.category.ecology',
        defaultTitle: 'Ecology',
        icon: SummaryEcologyIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.ecology.low',
                defaultText:
                    'Your responses suggest that ecology and green living may be new for you or less familiar at the moment. This is a positive starting point. Protecting our planet depends strongly on our level of knowledge about how daily actions—like our individual carbon footprint or water usage—impact the environment. The Ecology learning module has been specifically designed to assist you in developing a fundamental understanding of green habits. You will find clear explanations of basic terminology, simple recycling rules, and easy-to-implement energy-saving techniques. This module will help you build your confidence and lay the building blocks for a more sustainable lifestyle at your own pace.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.ecology.moderate',
                defaultText:
                    'Your results indicate a solid foundation in the area of ecology. You clearly possess a basic understanding of key topics such as waste reduction, recycling, and the importance of saving energy and water. The Ecology learning module can help you build on this foundation, clarify more complex points, and further support the practical use of these green solutions in your everyday life. Being effective in protecting the environment often requires a holistic approach—seeing how all our small changes, from shopping habits to home heating, work together. Therefore, we recommend focusing on filling your remaining knowledge gaps, equipping you with the tools necessary to live more ecologically in a modern world.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.ecology.good',
                defaultText:
                    'Your responses indicate a strong and well-developed understanding of ecology and sustainable living. You are well-aware of your individual carbon footprint and the "green changes" needed to protect our nature. The Ecology learning module offers opportunities to deepen your existing knowledge, reflect on your long-term experiences, and further develop your practical skills. With such a strong theoretical base, you will find it easy to transfer these ideas into real-world applications. Your deep knowledge may indicate that ecology is a subject close to your heart. We hope that the specific techniques and environmental approaches included in this course will serve as an inspiring starting point for your further, individual exploration.',
            },
        },
    },
    {
        category: QuestionCategoryEnum.DIGITAL_TECHNOLOGIES,
        categoryKey: 'digital-technologies',
        titleKey: 'poll.category.digitalTechnologies',
        defaultTitle: 'Digital technologies',
        icon: SummaryDigitalTechnologiesIcon,
        feedback: {
            [CompetenceLevelEnum.LOW]: {
                key: 'diagnosticResults.feedback.digitalTechnologies.low',
                defaultText:
                    'Your responses suggest that digital technologies may be new for you or less familiar at the moment. This is a positive starting point. Choosing the correct approach in a digital environment depends strongly on the level of knowledge and awareness of the tools, systems, and practices that shape how technology is used. The Digital Technologies learning module has been specifically designed to assist you in developing a fundamental understanding of digital technologies, enabling you to lay the building blocks for the further enhancement of these competences. Basic terminology, awareness of essential digital practices, and easy-to-implement techniques—you will find all that and more in the dedicated learning module.',
            },
            [CompetenceLevelEnum.MODERATE]: {
                key: 'diagnosticResults.feedback.digitalTechnologies.moderate',
                defaultText:
                    'Your results indicate a solid foundation in the area of digital technologies. You clearly possess a basic understanding of key concepts such as digital tools, online environments, and the responsible use of technology. The Digital Technologies learning module can help you build on this foundation, clarify key points, and further support the practical use of these skills in everyday situations. The effective use of digital technologies in complex and rapidly changing environments depends strongly on the ability to understand and respond to digital challenges in a holistic way. Therefore, we recommend focusing on the existing room for improvement, and filling the knowledge gaps, thus equipping yourself with the tools necessary to operate effectively in modern, technology-driven environments.',
            },
            [CompetenceLevelEnum.GOOD]: {
                key: 'diagnosticResults.feedback.digitalTechnologies.good',
                defaultText:
                    'Your responses indicate a strong and well-developed understanding of digital technologies. The Digital Technologies learning module offers opportunities to deepen your knowledge, reflect on experience, and further develop your skills. Through getting familiar with the learning content, you will be able to transfer the theoretical knowledge into real-world applications more easily, thanks to strong understanding and repeated self-reflection sessions. Your deep knowledge might also indicate that the area of digital technologies is one of your interests. In this case, we hope that you will perceive the information about the specific ideas, techniques, methods and approaches included in the course, as a starting point for further, individual exploration.',
            },
        },
    },
];
