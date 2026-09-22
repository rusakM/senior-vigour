import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../src/components/footer/footer';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
        }),
    };
});

describe('Footer Component', () => {
    it('renders EU logo and disclaimer text', () => {
        render(<Footer />);

        const euLogo = screen.getByAltText('Co-funded by the European Union');
        expect(euLogo).toBeInTheDocument();
        expect(screen.getByText(/Funded by the European Union/i)).toBeInTheDocument();
    });

    it('renders social icons and legal links', () => {
        render(<Footer />);

        expect(screen.getByAltText('LinkedIn')).toBeInTheDocument();
        expect(screen.getByAltText('Instagram')).toBeInTheDocument();
        expect(screen.getByAltText('YouTube')).toBeInTheDocument();

        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Terms of Use')).toBeInTheDocument();
    });
});
