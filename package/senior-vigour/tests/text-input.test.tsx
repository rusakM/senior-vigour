import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TextInput from '../src/components/text-input/text-input';

describe('TextInput Component', () => {
    it('renders input with placeholder and value', () => {
        render(
            <TextInput
                placeholder="Enter your email"
                value="test@example.com"
                onChange={() => {}}
            />
        );

        const input = screen.getByPlaceholderText('Enter your email');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('test@example.com');
    });

    it('triggers onChange when typed into', () => {
        const handleChange = vi.fn();
        render(
            <TextInput
                placeholder="Email"
                onChange={handleChange}
            />
        );

        const input = screen.getByPlaceholderText('Email');
        fireEvent.change(input, { target: { value: 'user@test.com' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('renders error message when error prop is provided', () => {
        render(
            <TextInput
                placeholder="Email"
                error="Invalid email format"
            />
        );

        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
});
