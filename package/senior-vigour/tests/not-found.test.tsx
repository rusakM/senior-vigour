import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../src/pages/not-found/not-found';
import { constantsUrls } from '../src/helpers/constants';

const mockedNavigate = vi.fn();
let mockIsMobile = false;

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

vi.mock('@tolgee/react', () => ({
    useTranslate: () => ({
        t: (_key: string, defaultValue?: string) => defaultValue || _key,
    }),
}));

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
    useMobileSmall: () => false,
}));

vi.mock('../src/components/background-shapes/background-shapes', () => ({
    default: () => <div data-testid="background-shapes" />,
}));

describe('NotFound (404) Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile = false;
    });

    it('renders 404 code, heading, description and home button on desktop', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );

        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
        expect(screen.getByTestId('not-found-code')).toHaveTextContent('404');
        expect(screen.getByTestId('not-found-title')).toHaveTextContent(
            'Nie znaleźliśmy tej strony'
        );
        expect(screen.getByTestId('not-found-description')).toHaveTextContent(
            'Strona mogła zostać przeniesiona lub adres jest nieaktualny.'
        );
        expect(screen.getByTestId('not-found-home-button')).toHaveTextContent(
            'Wróć na stronę główną'
        );

        const illustration = screen.getByTestId('not-found-illustration');
        expect(illustration).toBeInTheDocument();
        expect(illustration.getAttribute('src')).toContain('404_desktop');
    });

    it('renders mobile illustration when isMobile is true', () => {
        mockIsMobile = true;

        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );

        const illustration = screen.getByTestId('not-found-illustration');
        expect(illustration).toBeInTheDocument();
        expect(illustration.getAttribute('src')).toContain('404_mobile');
    });

    it('navigates to landing page when home button is clicked', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );

        const button = screen.getByTestId('not-found-home-button');
        fireEvent.click(button);

        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.LandingPage.main
        );
    });
});
