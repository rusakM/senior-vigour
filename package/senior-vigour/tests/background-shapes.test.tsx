import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackgroundShapes, { type BackgroundShapeItem } from '../src/components/background-shapes/background-shapes';
import styles from '../src/components/background-shapes/background-shapes.module.scss';

describe('BackgroundShapes Component', () => {
    it('renders the background shapes container with aria-hidden="true"', () => {
        render(<BackgroundShapes />);
        const container = screen.getByTestId('background-shapes');
        expect(container).toBeInTheDocument();
        expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders default 7 shapes with alternating mirror attributes', () => {
        render(<BackgroundShapes />);
        const shapes = screen.getAllByTestId(/^background-shape-/);
        expect(shapes).toHaveLength(7);

        // Check alternating mirrored states (0: false, 1: true, 2: false, 3: true, ...)
        expect(shapes[0]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[0].className).toContain(styles.normal);

        expect(shapes[1]).toHaveAttribute('data-mirrored', 'true');
        expect(shapes[1].className).toContain(styles.mirrored);

        expect(shapes[2]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[2].className).toContain(styles.normal);

        expect(shapes[3]).toHaveAttribute('data-mirrored', 'true');
        expect(shapes[3].className).toContain(styles.mirrored);

        expect(shapes[4]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[4].className).toContain(styles.normal);

        expect(shapes[5]).toHaveAttribute('data-mirrored', 'true');
        expect(shapes[5].className).toContain(styles.mirrored);

        expect(shapes[6]).toHaveAttribute('data-mirrored', 'false');
        expect(shapes[6].className).toContain(styles.normal);
    });

    it('renders custom shapes with custom top offsets', () => {
        const customShapes: BackgroundShapeItem[] = [
            { id: 'first', top: '10%', isMirrored: false },
            { id: 'second', top: '50%', isMirrored: true },
        ];

        render(<BackgroundShapes shapes={customShapes} className="custom-bg" />);
        const container = screen.getByTestId('background-shapes');
        expect(container.className).toContain('custom-bg');

        const shape1 = screen.getByTestId('background-shape-0');
        const shape2 = screen.getByTestId('background-shape-1');

        expect(shape1).toHaveStyle({ top: '10%' });
        expect(shape1).toHaveAttribute('data-mirrored', 'false');

        expect(shape2).toHaveStyle({ top: '50%' });
        expect(shape2).toHaveAttribute('data-mirrored', 'true');
    });
});
