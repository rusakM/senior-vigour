import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import Materials from '../src/pages/materials/materials';

let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
    useDeviceType: () => ({
        isDesktop: !mockIsMobile,
        isTablet: false,
        isMobile: mockIsMobile,
        isNotMobile: !mockIsMobile,
        isMobileSmall: false,
    }),
}));

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
        }),
    };
});

describe('Materials Page Component', () => {
    beforeEach(() => {
        mockIsMobile = false;
    });

    const renderComponent = () => {
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <Materials />
                </BrowserRouter>
            </Provider>
        );
    };

    it('renders the materials page with Header, Footer, and Handbook banner', () => {
        renderComponent();

        expect(screen.getByTestId('materials-page')).toBeInTheDocument();
        expect(screen.getByTestId('background-shapes')).toBeInTheDocument();
        expect(screen.getByText('Open the Mental Health Handbook')).toBeInTheDocument();
        expect(screen.getByText('Open Handbook')).toBeInTheDocument();
    });

    it('renders 6 learning area categories on desktop and allows switching categories', () => {
        renderComponent();

        const mentalHealthBtn = screen.getByTestId('category-btn-mental-health');
        const digitalTechBtn = screen.getByTestId('category-btn-digital-technologies');

        expect(mentalHealthBtn).toBeInTheDocument();
        expect(digitalTechBtn).toBeInTheDocument();

        // Switch to Digital technologies
        fireEvent.click(digitalTechBtn);

        expect(screen.getByText('Open the Digital Technologies Handbook')).toBeInTheDocument();
    });

    it('renders 5 Lesson Plans and 5 Infographics on desktop', () => {
        renderComponent();

        expect(screen.getByText('Lesson Plans')).toBeInTheDocument();
        expect(
            screen.getByText('Mental health in later life - awareness and understanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Your starting point - what you already bring')
        ).toBeInTheDocument();

        expect(screen.getByText('Infographics')).toBeInTheDocument();
        expect(screen.getByText('Infographic 1')).toBeInTheDocument();
        expect(screen.getByText('Infographic 5')).toBeInTheDocument();
    });

    it('renders mobile layout with category buttons, title, and slider controls', () => {
        mockIsMobile = true;
        renderComponent();

        expect(screen.getByRole('heading', { level: 2, name: 'Mental health' })).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-prev')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-next')).toBeInTheDocument();

        // Slide lesson plans
        const nextLpBtn = screen.getByTestId('lesson-plans-next');
        fireEvent.click(nextLpBtn);

        expect(
            screen.getByText('Your starting point - what you already bring')
        ).toBeInTheDocument();
    });
});
