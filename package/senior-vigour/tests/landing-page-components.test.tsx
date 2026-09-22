import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AreaCard from '../src/components/area-card/area-card';
import FlowStepCard from '../src/components/flow-step-card/flow-step-card';
import PartnersGrid, { type PartnerItem } from '../src/components/partners-grid/partners-grid';

describe('Landing Page Section Components', () => {
    describe('AreaCard', () => {
        it('renders title, description and triggers onMoreClick', () => {
            const handleMore = vi.fn();
            render(
                <AreaCard
                    title="Zdrowie psychiczne"
                    description="Opis obszaru zdrowia psychicznego"
                    iconSrc="test-icon.svg"
                    onMoreClick={handleMore}
                />
            );

            expect(screen.getByText('Zdrowie psychiczne')).toBeInTheDocument();
            expect(screen.getByText('Opis obszaru zdrowia psychicznego')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button'));
            expect(handleMore).toHaveBeenCalledTimes(1);
        });
    });

    describe('FlowStepCard', () => {
        it('renders step number, title and description', () => {
            render(
                <FlowStepCard
                    stepNumber={1}
                    title="Krok 1: Rejestracja"
                    description="Utwórz konto w serwisie"
                    imageSrc="test-flow.svg"
                />
            );

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('Krok 1: Rejestracja')).toBeInTheDocument();
            expect(screen.getByText('Utwórz konto w serwisie')).toBeInTheDocument();
        });
    });

    describe('PartnersGrid', () => {
        it('renders partner logos with correct links', () => {
            const mockPartners: PartnerItem[] = [
                { name: 'Partner 1', logoSrc: 'p1.png', url: 'https://partner1.com' },
                { name: 'Partner 2', logoSrc: 'p2.png', url: 'https://partner2.com' },
            ];

            render(<PartnersGrid partners={mockPartners} />);

            const partnerLink = screen.getByTitle('Partner 1');
            expect(partnerLink).toBeInTheDocument();
            expect(partnerLink).toHaveAttribute('href', 'https://partner1.com');
        });
    });
});
