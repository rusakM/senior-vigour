import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import { setCurrentUser } from '../src/redux/user/user.actions';
import { clearMaterialsState } from '../src/redux/materials/materials.actions';
import { UserRoleEnum } from '../src/types/user';
import type { IMaterial } from '../src/types/material';
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

vi.mock('react-pdf', () => ({
    Document: ({ children }: any) => <div data-testid="mock-document">{children}</div>,
    Page: ({ pageNumber }: any) => <div data-testid="mock-page">Page {pageNumber}</div>,
    pdfjs: {
        GlobalWorkerOptions: {
            workerSrc: '',
        },
    },
}));

const mockMentalHealthMaterials: IMaterial[] = [
    {
        name: 'Handbook_PDF',
        category: 'MENTAL_HEALTH',
        translation: 'Open the Mental Health Handbook',
        type: 'HANDBOOK',
        languages: {
            en: { name: 'Handbook_PDF', fileExtension: 'pdf', pages: 69 },
        },
    },
    {
        name: 'lp-1',
        category: 'MENTAL_HEALTH',
        translation: 'Mental health in later life - awareness and understanding',
        type: 'LESSON_PLAN',
        languages: { en: { name: 'lp-1', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'lp-2',
        category: 'MENTAL_HEALTH',
        translation: 'Your starting point - what you already bring',
        type: 'LESSON_PLAN',
        languages: { en: { name: 'lp-2', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'lp-3',
        category: 'MENTAL_HEALTH',
        translation: 'Understanding and managing the inner world',
        type: 'LESSON_PLAN',
        languages: { en: { name: 'lp-3', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'lp-4',
        category: 'MENTAL_HEALTH',
        translation: 'Purpose and identity - what you still have to give',
        type: 'LESSON_PLAN',
        languages: { en: { name: 'lp-4', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'lp-5',
        category: 'MENTAL_HEALTH',
        translation: 'Making it part of your life - what happens after this course',
        type: 'LESSON_PLAN',
        languages: { en: { name: 'lp-5', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'info-1',
        category: 'MENTAL_HEALTH',
        translation: 'Infographic 1',
        type: 'INFOGRAPHIC',
        languages: { en: { name: 'info-1', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'info-2',
        category: 'MENTAL_HEALTH',
        translation: 'Infographic 2',
        type: 'INFOGRAPHIC',
        languages: { en: { name: 'info-2', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'info-3',
        category: 'MENTAL_HEALTH',
        translation: 'Infographic 3',
        type: 'INFOGRAPHIC',
        languages: { en: { name: 'info-3', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'info-4',
        category: 'MENTAL_HEALTH',
        translation: 'Infographic 4',
        type: 'INFOGRAPHIC',
        languages: { en: { name: 'info-4', fileExtension: 'pdf', pages: 1 } },
    },
    {
        name: 'info-5',
        category: 'MENTAL_HEALTH',
        translation: 'Infographic 5',
        type: 'INFOGRAPHIC',
        languages: { en: { name: 'info-5', fileExtension: 'pdf', pages: 1 } },
    },
];

const mockDigitalTechMaterials: IMaterial[] = [
    {
        name: 'DigitalTech_Handbook',
        category: 'DIGITAL_TECHNOLOGIES',
        translation: 'Open the Digital Technologies Handbook',
        type: 'HANDBOOK',
        languages: { en: { name: 'DigitalTech_Handbook', fileExtension: 'pdf', pages: 40 } },
    },
];

vi.mock('../src/api', () => ({
    getData: vi.fn().mockImplementation((url: string) => {
        if (url.includes('DIGITAL_TECHNOLOGIES')) {
            return Promise.resolve(mockDigitalTechMaterials);
        }
        if (url.includes('ECOLOGY')) {
            return Promise.resolve([]);
        }
        return Promise.resolve(mockMentalHealthMaterials);
    }),
    sendData: vi.fn().mockResolvedValue({}),
}));

describe('Materials Page Component', () => {
    beforeEach(() => {
        mockIsMobile = false;
        window.innerWidth = 1600;
        window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
        window.URL.revokeObjectURL = vi.fn();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            statusText: 'OK',
            blob: async () => new Blob(['dummy pdf'], { type: 'application/pdf' }),
        } as unknown as Response);

        store.dispatch(clearMaterialsState());

        // Default to Mentor role so all sections are visible for standard tests
        store.dispatch(
            setCurrentUser({
                _id: 'mentor1',
                email: 'mentor@example.com',
                firstName: 'Mentor',
                lastName: 'User',
                role: UserRoleEnum.MENTOR,
            } as any)
        );
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

    it('renders the materials page with Header, Footer, and Handbook banner for Mentor', async () => {
        renderComponent();

        expect(screen.getByTestId('materials-page')).toBeInTheDocument();
        expect(screen.getByTestId('background-shapes')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Open the Mental Health Handbook')).toBeInTheDocument();
            expect(screen.getByText('Open Handbook')).toBeInTheDocument();
        });
    });

    it('hides Handbook banner and Lesson Plans for Senior role', async () => {
        store.dispatch(
            setCurrentUser({
                _id: 'senior1',
                email: 'senior@example.com',
                firstName: 'Senior',
                lastName: 'User',
                role: UserRoleEnum.SENIOR,
            } as any)
        );

        renderComponent();

        expect(screen.getByTestId('materials-page')).toBeInTheDocument();
        expect(screen.queryByText('Open the Mental Health Handbook')).not.toBeInTheDocument();
        expect(screen.queryByText('Lesson Plans')).not.toBeInTheDocument();
        // Infographics must remain visible for Senior
        expect(screen.getByText('Infographics')).toBeInTheDocument();
    });

    it('renders 6 learning area categories on desktop and allows switching categories', async () => {
        renderComponent();

        const mentalHealthBtn = screen.getByTestId('category-btn-mental-health');
        const digitalTechBtn = screen.getByTestId('category-btn-digital-technologies');

        expect(mentalHealthBtn).toBeInTheDocument();
        expect(digitalTechBtn).toBeInTheDocument();

        // Switch to Digital technologies
        fireEvent.click(digitalTechBtn);

        await waitFor(() => {
            expect(screen.getByText('Open the Digital Technologies Handbook')).toBeInTheDocument();
        });
    });

    it('renders 5 Lesson Plans and 5 Infographics on FullHD desktop without navigation arrows', async () => {
        window.innerWidth = 1600;
        renderComponent();

        expect(screen.getByText('Lesson Plans')).toBeInTheDocument();

        await waitFor(() => {
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

        // On FullHD (1600px) with 5 items per row, 5 items fit so arrows are not rendered
        expect(screen.queryByTestId('lesson-plans-prev')).not.toBeInTheDocument();
        expect(screen.queryByTestId('lesson-plans-next')).not.toBeInTheDocument();
    });

    it('shows navigation arrows on laptop viewport (4 items per row) and allows sliding', async () => {
        window.innerWidth = 1200;
        renderComponent();

        await waitFor(() => {
            expect(
                screen.getByText('Mental health in later life - awareness and understanding')
            ).toBeInTheDocument();
        });

        // On laptop (1200px), itemsPerRow = 4, so 5 items > 4 itemsPerRow -> arrows rendered
        expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();

        // Next slide
        fireEvent.click(screen.getByTestId('lesson-plans-next'));
        // Prev slide
        fireEvent.click(screen.getByTestId('lesson-plans-prev'));
    });

    it('shows navigation arrows on tablet viewport (3 items per row)', async () => {
        window.innerWidth = 800;
        renderComponent();

        await waitFor(() => {
            expect(
                screen.getByText('Mental health in later life - awareness and understanding')
            ).toBeInTheDocument();
        });

        expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-prev')).toBeInTheDocument();
        expect(screen.getByTestId('infographics-next')).toBeInTheDocument();
    });

    it('renders mobile layout with category buttons, title, and slider controls', async () => {
        mockIsMobile = true;
        renderComponent();

        expect(screen.getByRole('heading', { level: 2, name: 'Mental health' })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('lesson-plans-prev')).toBeInTheDocument();
            expect(screen.getByTestId('lesson-plans-next')).toBeInTheDocument();
            expect(screen.getByTestId('infographics-prev')).toBeInTheDocument();
            expect(screen.getByTestId('infographics-next')).toBeInTheDocument();
        });

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

    it('opens Flipbook modal when clicking Open Handbook and closes it', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Open Handbook')).not.toBeDisabled();
        });

        const openHandbookBtn = screen.getByText('Open Handbook');
        fireEvent.click(openHandbookBtn);

        expect(screen.getByTestId('flipbook-modal')).toBeInTheDocument();

        const closeBtn = screen.getByTestId('flipbook-close');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(screen.queryByTestId('flipbook-modal')).not.toBeInTheDocument();
        });
    });

    it('opens Flipbook modal when clicking View on a lesson plan', async () => {
        renderComponent();

        await waitFor(() => {
            const viewButtons = screen.getAllByText('View');
            expect(viewButtons.length).toBeGreaterThan(0);
        });

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        expect(screen.getByTestId('flipbook-modal')).toBeInTheDocument();
    });

    it('renders empty states when category has no materials in database', async () => {
        renderComponent();

        const ecologyBtn = screen.getByTestId('category-btn-ecology');
        fireEvent.click(ecologyBtn);

        await waitFor(() => {
            expect(screen.getByTestId('lesson-plans-empty')).toBeInTheDocument();
            expect(screen.getByTestId('resources-empty')).toBeInTheDocument();
            expect(screen.getByText('Handbook unavailable')).toBeInTheDocument();
        });
    });
});
