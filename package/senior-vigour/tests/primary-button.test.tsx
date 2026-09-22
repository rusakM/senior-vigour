import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrimaryButton from '../src/components/primary-button/primary-button';

describe('PrimaryButton Component', () => {
    it('renders children correctly', () => {
        render(<PrimaryButton color="violet">Click me</PrimaryButton>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('triggers onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<PrimaryButton color="violet" onClick={handleClick}>Click me</PrimaryButton>);

        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick when disabled', () => {
        const handleClick = vi.fn();
        render(<PrimaryButton color="violet" disabled onClick={handleClick}>Disabled</PrimaryButton>);

        const button = screen.getByText('Disabled');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies additional classes correctly', () => {
        render(<PrimaryButton color="red" additionalClasses="custom-class">Custom</PrimaryButton>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('custom-class');
    });

    it('applies rounded (circle) and size classes properly', () => {
        const { container } = render(
            <PrimaryButton color="violet" rounded size="large">
                Rounded Large
            </PrimaryButton>
        );
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.className).toMatch(/circle/);
        expect(button?.className).toMatch(/large/);
    });
});
