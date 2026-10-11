import { type FC, useMemo, useRef, useState, useEffect } from 'react';
import BgShapeSvg from '../../assets/landing-page/bg_shape_1.svg';
import { useMobile } from '../../helpers/responsiveContainers';
import styles from './background-shapes.module.scss';

export interface BackgroundShapeItem {
    id: number | string;
    top?: string;
    isMirrored?: boolean;
}

export interface BackgroundShapesProps {
    shapes?: BackgroundShapeItem[];
    className?: string;
    desktopOffset?: string;
    mobileOffset?: string;
    step?: string;
    count?: number;
}

function parseOffsetToVh(
    offset: string | number,
    viewportHeight: number,
    containerHeight: number
): number {
    if (typeof offset === 'number') {
        return offset;
    }
    const trimmed = offset.trim();
    if (trimmed.endsWith('vh')) {
        return parseFloat(trimmed);
    }
    if (trimmed.endsWith('px')) {
        return viewportHeight > 0 ? (parseFloat(trimmed) / viewportHeight) * 100 : parseFloat(trimmed);
    }
    if (trimmed.endsWith('%')) {
        return containerHeight > 0 && viewportHeight > 0
            ? ((parseFloat(trimmed) / 100) * containerHeight / viewportHeight) * 100
            : parseFloat(trimmed);
    }
    const val = parseFloat(trimmed);
    return isNaN(val) ? 0 : val;
}

const BackgroundShapes: FC<BackgroundShapesProps> = ({
    shapes,
    className,
    desktopOffset = '-50vh',
    mobileOffset = '5vh',
    step = '100vh',
    count,
}) => {
    const isMobile = useMobile();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    useEffect(() => {
        const updateHeight = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            const height = containerRef.current.offsetHeight || parent?.offsetHeight || 0;
            if (height > 0) {
                setContainerHeight(height);
            }
        };

        updateHeight();

        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const height =
                        entry.contentRect.height || (entry.target as HTMLElement).offsetHeight;
                    if (height > 0) {
                        setContainerHeight(height);
                    }
                }
            });

            observer.observe(containerRef.current);
            if (containerRef.current.parentElement) {
                observer.observe(containerRef.current.parentElement);
            }

            return () => observer.disconnect();
        } else if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, []);

    const activeOffset = isMobile ? mobileOffset : desktopOffset;

    const calculatedShapes = useMemo<BackgroundShapeItem[]>(() => {
        if (shapes) {
            return shapes;
        }

        const viewportHeight =
            typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800;
        const startOffsetVh = parseOffsetToVh(activeOffset, viewportHeight, containerHeight);
        const stepVh = parseOffsetToVh(step, viewportHeight, containerHeight);

        if (typeof count === 'number' && count > 0) {
            const result: BackgroundShapeItem[] = [];
            for (let i = 0; i < count; i++) {
                result.push({
                    id: `shape-${i}`,
                    top: `${startOffsetVh + i * stepVh}vh`,
                    isMirrored: i % 2 === 1,
                });
            }
            return result;
        }

        const containerHeightVh =
            containerHeight > 0 ? (containerHeight / viewportHeight) * 100 : 100;

        const result: BackgroundShapeItem[] = [
            {
                id: 'shape-0',
                top: `${startOffsetVh}vh`,
                isMirrored: false,
            },
        ];

        if (stepVh > 0 && containerHeightVh > 0) {
            let index = 1;
            while (startOffsetVh + index * stepVh <= containerHeightVh - 40) {
                result.push({
                    id: `shape-${index}`,
                    top: `${startOffsetVh + index * stepVh}vh`,
                    isMirrored: index % 2 === 1,
                });
                index++;
            }
        }

        return result;
    }, [shapes, activeOffset, step, count, containerHeight]);

    return (
        <div
            ref={containerRef}
            className={`${styles.container}${className ? ` ${className}` : ''}`}
            aria-hidden="true"
            data-testid="background-shapes"
        >
            {calculatedShapes.map((shape, index) => {
                const isMirrored = shape.isMirrored ?? index % 2 === 1;
                return (
                    <div
                        key={shape.id}
                        data-testid={`background-shape-${index}`}
                        data-mirrored={isMirrored}
                        className={`${styles.shapeWrapper} ${
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
