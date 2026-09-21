import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootContainer from '../src/components/root-container/root-container';
import ContentContainer from '../src/components/content-container/content-container';
import PrimaryContainer from '../src/components/primary-container/primary-container';
import PageContainer from '../src/page-components/page-container/page-container';

describe('Container Components', () => {
    describe('RootContainer', () => {
        it('renders children inside root viewer container', () => {
            render(
                <RootContainer>
                    <span data-testid="root-child">Root Content</span>
                </RootContainer>
            );
            expect(screen.getByTestId('root-child')).toBeInTheDocument();
        });
    });

    describe('ContentContainer', () => {
        it('renders children correctly', () => {
            render(
                <ContentContainer>
                    <span data-testid="content-child">Inner Content</span>
                </ContentContainer>
            );
            expect(screen.getByTestId('content-child')).toBeInTheDocument();
        });
    });

    describe('PrimaryContainer', () => {
        it('renders default div with children and combined classes', () => {
            const { container } = render(
                <PrimaryContainer direction="column" contentAlignment="center" width="desktopFit">
                    <p>Primary item</p>
                </PrimaryContainer>
            );

            const primaryDiv = container.firstElementChild;
            expect(primaryDiv?.tagName).toBe('DIV');
            expect(screen.getByText('Primary item')).toBeInTheDocument();
        });

        it('supports semantic HTML tags using "as" prop', () => {
            const { container } = render(
                <PrimaryContainer as="section" direction="row">
                    <h2>Section Header</h2>
                </PrimaryContainer>
            );

            const sectionEl = container.firstElementChild;
            expect(sectionEl?.tagName).toBe('SECTION');
            expect(screen.getByText('Section Header')).toBeInTheDocument();
        });
    });

    describe('PageContainer', () => {
        it('wraps children inside ContentContainer', () => {
            render(
                <PageContainer additionalClasses="custom-page">
                    <h1>Page Title</h1>
                </PageContainer>
            );

            expect(screen.getByText('Page Title')).toBeInTheDocument();
        });
    });
});
