import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import EducatorsGuide from '../src/pages/educators-guide/educators-guide';
import { UserRoleEnum, type IUser } from '../src/types/user';
import { constantsUrls } from '../src/helpers/constants';

let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
}));

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (_key: string, defaultValue?: string) => defaultValue || _key,
        }),
    };
});

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

const createTestStore = (currentUser: Partial<IUser> | null = null) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser: currentUser as IUser | null,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
        },
    });
};

describe('EducatorsGuide Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile = false;
    });

    describe('Access Control & Role Restriction', () => {
        it('redirects unauthenticated user (currentUser === null) to sign-in page', () => {
            const store = createTestStore(null);

            const { container } = render(
                <Provider store={store}>
                    <BrowserRouter>
                        <EducatorsGuide />
                    </BrowserRouter>
                </Provider>
            );

            expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.LandingPage.signIn, {
                replace: true,
            });
            expect(container).toBeEmptyDOMElement();
        });

        it('redirects user with SENIOR role to materials page', () => {
            const store = createTestStore({
                _id: 'user-senior-1',
                email: 'senior@example.com',
                firstName: 'Senior',
                lastName: 'User',
                role: UserRoleEnum.SENIOR,
            });

            const { container } = render(
                <Provider store={store}>
                    <BrowserRouter>
                        <EducatorsGuide />
                    </BrowserRouter>
                </Provider>
            );

            expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.Main.materials, {
                replace: true,
            });
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('Rendering for MENTOR Role', () => {
        const mentorUser: Partial<IUser> = {
            _id: 'user-mentor-1',
            email: 'mentor@example.com',
            firstName: 'Mentor',
            lastName: 'User',
            role: UserRoleEnum.MENTOR,
        };

        it('renders heading, all 3 bullet points, document card, and action buttons', () => {
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.educatorsGuide]}>
                        <EducatorsGuide />
                    </MemoryRouter>
                </Provider>
            );

            expect(mockedNavigate).not.toHaveBeenCalled();

            // Heading
            expect(
                screen.getByRole('heading', {
                    name: "Educator’s Guide for Working with Seniors",
                })
            ).toBeInTheDocument();

            // 3 bullet items
            expect(
                screen.getByText('Practical guidance for working with seniors')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Geragogy, communication and essential soft skills')
            ).toBeInTheDocument();
            expect(
                screen.getByText('12 good practices for educators and caregivers')
            ).toBeInTheDocument();

            // Document card
            expect(screen.getByTestId('educators-guide-card')).toBeInTheDocument();

            // Action buttons
            expect(screen.getByTestId('educators-guide-view')).toHaveTextContent('View File');
            expect(screen.getByTestId('educators-guide-download')).toHaveTextContent(
                'Download Document'
            );
        });

        it('calls onViewFile callback when View File button is clicked', () => {
            const store = createTestStore(mentorUser);
            const handleViewFile = vi.fn();

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.educatorsGuide]}>
                        <EducatorsGuide onViewFile={handleViewFile} />
                    </MemoryRouter>
                </Provider>
            );

            const viewBtn = screen.getByTestId('educators-guide-view');
            fireEvent.click(viewBtn);

            expect(handleViewFile).toHaveBeenCalledTimes(1);
        });

        it('calls onDownloadDocument callback when Download Document button is clicked', () => {
            const store = createTestStore(mentorUser);
            const handleDownload = vi.fn();

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.educatorsGuide]}>
                        <EducatorsGuide onDownloadDocument={handleDownload} />
                    </MemoryRouter>
                </Provider>
            );

            const downloadBtn = screen.getByTestId('educators-guide-download');
            fireEvent.click(downloadBtn);

            expect(handleDownload).toHaveBeenCalledTimes(1);
        });

        it('handles clicks safely when callbacks are not provided', () => {
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.educatorsGuide]}>
                        <EducatorsGuide />
                    </MemoryRouter>
                </Provider>
            );

            const viewBtn = screen.getByTestId('educators-guide-view');
            const downloadBtn = screen.getByTestId('educators-guide-download');

            expect(() => {
                fireEvent.click(viewBtn);
                fireEvent.click(downloadBtn);
            }).not.toThrow();
        });

        it('renders properly in mobile layout mode', () => {
            mockIsMobile = true;
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.educatorsGuide]}>
                        <EducatorsGuide />
                    </MemoryRouter>
                </Provider>
            );

            expect(screen.getByTestId('educators-guide-page')).toBeInTheDocument();
            expect(
                screen.getByRole('heading', {
                    name: "Educator’s Guide for Working with Seniors",
                })
            ).toBeInTheDocument();
            expect(screen.getByTestId('educators-guide-card')).toBeInTheDocument();
        });
    });
});
