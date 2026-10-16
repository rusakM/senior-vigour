import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import Materials from '../src/pages/materials/materials';
let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../src/helpers/responsiveContainers')>();
    return {
        ...actual,
        useMobile: () => mockIsMobile,
        useDeviceType: () => ({
            isDesktop: !mockIsMobile,
            isTablet: false,
            isMobile: mockIsMobile,
            isNotMobile: !mockIsMobile,
            isMobileSmall: false,
        }),
    };
});

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
        window.innerWidth = 1600;
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

    it('renders 5 Lesson Plans and 5 Infographics on FullHD desktop without navigation arrows', () => {
        window.innerWidth = 1600;
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

        // On FullHD (1600px) with 5 items per row, 5 items fit so arrows are not rendered
        expect(screen.queryByTestId('lesson-plans-prev')).not.toBeInTheDocument();
        expect(screen.queryByTestId('lesson-plans-next')).not.toBeInTheDocument();
    });

    it('shows navigation arrows on laptop viewport (4 items per row) and allows sliding', () => {
        window.innerWidth = 1200;
        renderComponent();

        // On laptop (1200px), itemsPerRow = 4, so 5 items > 4 itemsPerRow -> arrows rendered
        expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();

        // Next slide
        fireEvent.click(screen.getByTestId('lesson-plans-next'));
        // Prev slide
        fireEvent.click(screen.getByTestId('lesson-plans-prev'));
    });

    it('shows navigation arrows on tablet viewport (3 items per row)', () => {
        window.innerWidth = 800;
        renderComponent();

        expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-prev')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-next')).toBeInTheDocument();
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

    it('supports drag swipe interactions on category selector', () => {
        renderComponent();

        const categoryRow = screen.getByRole('tablist');
        expect(categoryRow).toBeInTheDocument();

        // Simulate mouse drag
        fireEvent.mouseDown(categoryRow, { pageX: 200 });
        fireEvent.mouseMove(categoryRow, { pageX: 100 });
        fireEvent.mouseUp(categoryRow);
    });
});
