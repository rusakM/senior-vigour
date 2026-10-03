import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from '../src/components/checkbox/checkbox';

describe('Checkbox Component', () => {
    it('renders with label and unchecked by default', () => {
        const handleChange = vi.fn();
        render(
            <Checkbox
                id="terms"
                checked={false}
                onChange={handleChange}
                label="I accept terms"
            />
        );

        const input = screen.getByRole('checkbox');
        expect(input).toBeInTheDocument();
        expect(input).not.toBeChecked();
        expect(screen.getByText('I accept terms')).toBeInTheDocument();
    });

    it('toggles when clicked', () => {
        let checked = false;
        const handleChange = vi.fn((e) => {
            checked = e.target.checked;
        });

        const { rerender } = render(
            <Checkbox
                id="terms"
                checked={checked}
                onChange={handleChange}
                label="I accept terms"
            />
        );

        const input = screen.getByRole('checkbox');
        fireEvent.click(input);
        expect(handleChange).toHaveBeenCalledTimes(1);

        rerender(
            <Checkbox
                id="terms"
                checked={checked}
                onChange={handleChange}
                label="I accept terms"
            />
        );
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders complex JSX label with clickable link', () => {
        const handleChange = vi.fn();
        render(
            <Checkbox
                id="terms"
                checked={false}
                onChange={handleChange}
                label={
                    <>
                        I have read and accept the{' '}
                        <a href="/terms.pdf" target="_blank" rel="noopener noreferrer">
                            Terms and Condition
                        </a>
                    </>
                }
            />
        );

        const link = screen.getByRole('link', { name: /terms and condition/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/terms.pdf');
    });
});
