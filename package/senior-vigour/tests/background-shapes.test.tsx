import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackgroundShapes, { type BackgroundShapeItem } from '../src/components/background-shapes/background-shapes';
import styles from '../src/components/background-shapes/background-shapes.module.scss';

let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
}));

describe('BackgroundShapes Component', () => {
    beforeEach(() => {
        mockIsMobile = false;
    });

    it('renders the background shapes container with aria-hidden="true"', () => {
        render(<BackgroundShapes />);
        const container = screen.getByTestId('background-shapes');
        expect(container).toBeInTheDocument();
        expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders default shape with top: -50vh on desktop', () => {
        render(<BackgroundShapes />);
        const shape = screen.getByTestId('background-shape-0');
        expect(shape).toBeInTheDocument();
        expect(shape.style.top).toBe('-50vh');
        expect(shape).toHaveAttribute('data-mirrored', 'false');
        expect(shape.className).toContain(styles.normal);
    });

    it('renders default shape with top: 5vh on mobile', () => {
        mockIsMobile = true;
        render(<BackgroundShapes />);
        const shape = screen.getByTestId('background-shape-0');
        expect(shape).toBeInTheDocument();
        expect(shape.style.top).toBe('5vh');
        expect(shape).toHaveAttribute('data-mirrored', 'false');
    });

    it('applies custom desktopOffset and mobileOffset', () => {
        mockIsMobile = false;
        const { rerender } = render(
            <BackgroundShapes desktopOffset="50vh" mobileOffset="90vh" />
        );
        let shape = screen.getByTestId('background-shape-0');
        expect(shape.style.top).toBe('50vh');

        mockIsMobile = true;
        rerender(<BackgroundShapes desktopOffset="50vh" mobileOffset="90vh" />);
        shape = screen.getByTestId('background-shape-0');
        expect(shape.style.top).toBe('90vh');
    });

    it('renders multiple shapes with alternating mirrored attributes when count is specified', () => {
        render(<BackgroundShapes count={4} desktopOffset="-50vh" step="100vh" />);
        const shapes = screen.getAllByTestId(/^background-shape-/);
        expect(shapes).toHaveLength(4);

        expect(shapes[0].style.top).toBe('-50vh');
        expect(shapes[0]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[0].className).toContain(styles.normal);

        expect(shapes[1].style.top).toBe('50vh');
        expect(shapes[1]).toHaveAttribute('data-mirrored', 'true');
        expect(shapes[1].className).toContain(styles.mirrored);

        expect(shapes[2].style.top).toBe('150vh');
        expect(shapes[2]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[2].className).toContain(styles.normal);

        expect(shapes[3].style.top).toBe('250vh');
        expect(shapes[3]).toHaveAttribute('data-mirrored', 'true');
        expect(shapes[3].className).toContain(styles.mirrored);
    });

    it('renders custom shapes with custom top offsets when shapes prop is provided', () => {
        const customShapes: BackgroundShapeItem[] = [
            { id: 'first', top: '10%', isMirrored: false },
            { id: 'second', top: '50%', isMirrored: true },
        ];

        render(<BackgroundShapes shapes={customShapes} className="custom-bg" />);
        const container = screen.getByTestId('background-shapes');
        expect(container.className).toContain('custom-bg');

        const shape1 = screen.getByTestId('background-shape-0');
        const shape2 = screen.getByTestId('background-shape-1');

        expect(shape1.style.top).toBe('10%');
        expect(shape1).toHaveAttribute('data-mirrored', 'false');

        expect(shape2.style.top).toBe('50%');
        expect(shape2).toHaveAttribute('data-mirrored', 'true');
    });
});
