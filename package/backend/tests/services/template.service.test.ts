import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Register, Login } from '../../src/services/template.service';
import { fileService } from '../../src/services';
import { ConstantsGlobal } from '../../src/core/constants';

describe('template.service', () => {
    const testCode = '748291';
    const forbiddenPatterns = ['PlanetGoals', 'SafeWeb', '🌍', '#fdb84e', '#FDB84E'];

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('Login.renderLogin', () => {
        it('should return a tuple of [html, text, subject]', async () => {
            const result = await Login.renderLogin(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);

            const [html, text, subject] = result;
            expect(typeof html).toBe('string');
            expect(typeof text).toBe('string');
            expect(typeof subject).toBe('string');
        });

        it('should contain verificationCode in both html and text', async () => {
            const [html, text] = await Login.renderLogin(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(html).toContain(testCode);
            expect(text).toContain(testCode);
        });

        it('should have Senior Vigour branding and correct default subject', async () => {
            const [html, text, subject] = await Login.renderLogin(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(subject).toBe('Your Senior Vigour login code');
            expect(html).toContain('Senior Vigour');
            expect(text).toContain('Senior Vigour');
            expect(html).toContain('🌳');
        });

        it('should not contain any forbidden legacy strings or obsolete styling', async () => {
            const [html, text, subject] = await Login.renderLogin(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            for (const pattern of forbiddenPatterns) {
                expect(html, `html contains forbidden pattern "${pattern}"`).not.toContain(pattern);
                expect(text, `text contains forbidden pattern "${pattern}"`).not.toContain(pattern);
                expect(subject, `subject contains forbidden pattern "${pattern}"`).not.toContain(pattern);
            }
        });

        it('should render custom translations when fileService returns valid translation JSON', async () => {
            const mockTranslations = JSON.stringify({
                email: {
                    login: {
                        subject: 'Twój kod logowania do Senior Vigour',
                        welcome: 'Cześć! 👋',
                        intro: 'Otrzymaliśmy prośbę o logowanie do Senior Vigour.',
                        code: 'Twój kod:',
                        hint: 'Wpisz kod na stronie.',
                        validity: '⏱️ Ważny 10 minut.',
                        notice: 'Jeśli to nie Ty, zignoruj.',
                        bye: 'Do zobaczenia w Senior Vigour!',
                        assignation: 'Zespół Senior Vigour',
                        copyright: 'Senior Vigour. Wszelkie prawa zastrzeżone.',
                    },
                },
            });

            vi.spyOn(fileService, 'read').mockResolvedValue(mockTranslations);

            const [html, text, subject] = await Login.renderLogin(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.pl, testCode);

            expect(subject).toBe('Twój kod logowania do Senior Vigour');
            expect(html).toContain('Twój kod logowania do Senior Vigour');
            expect(html).toContain('Otrzymaliśmy prośbę o logowanie do Senior Vigour.');
            expect(text).toContain('Otrzymaliśmy prośbę o logowanie do Senior Vigour.');
            expect(html).toContain(testCode);
            expect(text).toContain(testCode);
        });
    });

    describe('Register.renderRegister', () => {
        it('should return a tuple of [html, text, subject]', async () => {
            const result = await Register.renderRegister(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);

            const [html, text, subject] = result;
            expect(typeof html).toBe('string');
            expect(typeof text).toBe('string');
            expect(typeof subject).toBe('string');
        });

        it('should contain verificationCode in both html and text (checking plain text code interpolation fix)', async () => {
            const [html, text] = await Register.renderRegister(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(html).toContain(testCode);
            expect(text).toContain(testCode);
        });

        it('should have Senior Vigour branding and correct default subject', async () => {
            const [html, text, subject] = await Register.renderRegister(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            expect(subject).toBe('Senior Vigour - account registration');
            expect(html).toContain('Senior Vigour');
            expect(text).toContain('Senior Vigour');
            expect(html).toContain('🌳');
        });

        it('should not contain any forbidden legacy strings or obsolete styling', async () => {
            const [html, text, subject] = await Register.renderRegister(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, testCode);

            for (const pattern of forbiddenPatterns) {
                expect(html, `html contains forbidden pattern "${pattern}"`).not.toContain(pattern);
                expect(text, `text contains forbidden pattern "${pattern}"`).not.toContain(pattern);
                expect(subject, `subject contains forbidden pattern "${pattern}"`).not.toContain(pattern);
            }
        });

        it('should render custom translations when fileService returns valid translation JSON', async () => {
            const mockTranslations = JSON.stringify({
                email: {
                    registration: {
                        subject: 'Senior Vigour - rejestracja konta',
                        welcome: 'Cześć! 👋',
                        intro: 'Dziękujemy za rejestrację w Senior Vigour.',
                        code: 'Twój kod weryfikacyjny:',
                        hint: 'Wpisz kod na stronie.',
                        validity: '⏱️ Ważny 10 minut.',
                        notice: 'Jeśli to nie Ty, zignoruj.',
                        bye: 'Do zobaczenia w Senior Vigour!',
                        assignation: 'Zespół Senior Vigour',
                        copyright: 'Senior Vigour. Wszelkie prawa zastrzeżone.',
                    },
                },
            });

            vi.spyOn(fileService, 'read').mockResolvedValue(mockTranslations);

            const [html, text, subject] = await Register.renderRegister(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.pl, testCode);

            expect(subject).toBe('Senior Vigour - rejestracja konta');
            expect(html).toContain('Senior Vigour - rejestracja konta');
            expect(html).toContain('Dziękujemy za rejestrację w Senior Vigour.');
            expect(text).toContain('Dziękujemy za rejestrację w Senior Vigour.');
            expect(html).toContain(testCode);
            expect(text).toContain(testCode);
        });
    });
});
