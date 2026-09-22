import type { FC } from 'react';
import BgShapeSvg from '../../assets/landing-page/bg_shape_1.svg';
import styles from './background-shapes.module.scss';

export interface BackgroundShapeItem {
    id: number | string;
    top?: string;
    isMirrored?: boolean;
}

export interface BackgroundShapesProps {
    shapes?: BackgroundShapeItem[];
    className?: string;
}

const DEFAULT_SHAPES: BackgroundShapeItem[] = [
    { id: 1, isMirrored: false },
    { id: 2, isMirrored: true },
    { id: 3, isMirrored: false },
    { id: 4, isMirrored: true },
    { id: 5, isMirrored: false },
    { id: 6, isMirrored: true },
    { id: 7, isMirrored: false },
];

const BackgroundShapes: FC<BackgroundShapesProps> = ({ shapes = DEFAULT_SHAPES, className }) => {
    return (
        <div
            className={`${styles.container}${className ? ` ${className}` : ''}`}
            aria-hidden="true"
            data-testid="background-shapes"
        >
            {shapes.map((shape, index) => {
                const isMirrored = shape.isMirrored ?? index % 2 === 1;
                return (
                    <div
                        key={shape.id}
                        data-testid={`background-shape-${index}`}
                        data-mirrored={isMirrored}
                        className={`${styles.shapeWrapper} ${styles[`shape_${index + 1}`] || ''} ${
                            isMirrored ? styles.mirrored : styles.normal
                        }`}
                        style={shape.top ? { top: shape.top } : undefined}
                    >
                        <img
                            src={BgShapeSvg}
                            alt=""
                            className={styles.shapeImage}
                            role="presentation"
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default BackgroundShapes;
