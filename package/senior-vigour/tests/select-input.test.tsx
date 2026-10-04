import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SelectInput from '../src/components/select-input/select-input';

describe('SelectInput Component', () => {
    const mockOptions = [
        { label: 'Germany', value: 'DE' },
        { label: 'Italy', value: 'IT' },
        { label: 'Poland', value: 'PL' },
        { label: 'Slovenia', value: 'SI' },
    ];

    it('renders input with placeholder and chevron icon', () => {
        render(
            <SelectInput
                options={mockOptions}
                placeholder="Country"
                name="country"
                id="country"
            />
        );

        const input = screen.getByPlaceholderText('Country');
        expect(input).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle dropdown/i })).toBeInTheDocument();
    });

    it('opens dropdown and displays options when input is clicked', () => {
        render(
            <SelectInput
                options={mockOptions}
                placeholder="Country"
            />
        );

        const input = screen.getByPlaceholderText('Country');
        fireEvent.click(input);

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Germany')).toBeInTheDocument();
        expect(screen.getByText('Slovenia')).toBeInTheDocument();
        expect(screen.getByText('Poland')).toBeInTheDocument();
        expect(screen.getByText('Italy')).toBeInTheDocument();
    });

    it('filters options when typing in the input', () => {
        render(
            <SelectInput
                options={mockOptions}
                placeholder="Country"
            />
        );

        const input = screen.getByPlaceholderText('Country');
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: 'Pol' } });

        expect(screen.getByText('Poland')).toBeInTheDocument();
        expect(screen.queryByText('Germany')).not.toBeInTheDocument();
        expect(screen.queryByText('Italy')).not.toBeInTheDocument();
    });

    it('calls onChange with option value and closes dropdown on option click', () => {
        const onChangeMock = vi.fn();
        render(
            <SelectInput
                options={mockOptions}
                placeholder="Country"
                onChange={onChangeMock}
            />
        );

        const input = screen.getByPlaceholderText('Country');
        fireEvent.click(input);

        const option = screen.getByText('Slovenia');
        fireEvent.click(option);

        expect(onChangeMock).toHaveBeenCalledWith('SI');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders selected option value in input and highlights selected item in dropdown', () => {
        render(
            <SelectInput
                options={mockOptions}
                value="SI"
                placeholder="Country"
                initialOpened
            />
        );

        const input = screen.getByDisplayValue('Slovenia');
        expect(input).toBeInTheDocument();

        const selectedItem = screen.getByText('Slovenia');
        expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    });

    it('closes dropdown when clicking outside', () => {
        render(
            <div>
                <SelectInput
                    options={mockOptions}
                    placeholder="Country"
                    initialOpened
                />
                <button type="button">Outside element</button>
            </div>
        );

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        fireEvent.mouseDown(document.body);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
});
