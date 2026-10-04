import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import SelectRole from '../src/pages/select-role/select-role';
import { UserRoleEnum } from '../src/types/user';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
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

describe('SelectRole Page Component', () => {
    it('renders Header, illustration, title, question, YES/NO options, and action buttons', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        // Header logo
        expect(screen.getByAltText('Senior Vigour Logo')).toBeInTheDocument();

        // Background shapes
        expect(screen.getByTestId('background-shapes')).toBeInTheDocument();

        const main = screen.getByRole('main');

        // Illustration
        expect(screen.getByRole('presentation')).toBeInTheDocument();

        // Title & Question
        expect(within(main).getByRole('heading', { name: /tell us more about yourself!/i })).toBeInTheDocument();
        expect(within(main).getByText(/are you an educator\?/i)).toBeInTheDocument();

        // YES and NO options
        expect(within(main).getByRole('radio', { name: /^yes$/i })).toBeInTheDocument();
        expect(within(main).getByRole('radio', { name: /^no$/i })).toBeInTheDocument();

        // Action buttons
        expect(within(main).getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('allows selecting YES (MENTOR) and submitting role', () => {
        const onSelectRoleMock = vi.fn();
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SelectRole onSelectRole={onSelectRoleMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        fireEvent.click(yesOption);

        expect(yesOption).toHaveAttribute('aria-checked', 'true');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSelectRoleMock).toHaveBeenCalledWith(UserRoleEnum.MENTOR);
    });

    it('allows selecting NO (SENIOR) and submitting role', () => {
        const onSelectRoleMock = vi.fn();
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SelectRole onSelectRole={onSelectRoleMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const noOption = within(main).getByRole('radio', { name: /^no$/i });
        fireEvent.click(noOption);

        expect(noOption).toHaveAttribute('aria-checked', 'true');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSelectRoleMock).toHaveBeenCalledWith(UserRoleEnum.SENIOR);
    });

    it('preselects role when initialRole prop is provided', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SelectRole initialRole={UserRoleEnum.MENTOR} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        const noOption = within(main).getByRole('radio', { name: /^no$/i });

        expect(yesOption).toHaveAttribute('aria-checked', 'true');
        expect(noOption).toHaveAttribute('aria-checked', 'false');
    });
});
