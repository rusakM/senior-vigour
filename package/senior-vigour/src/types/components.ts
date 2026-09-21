import type { ReactNode } from 'react';

export interface IComponentWithChildren {
    children: ReactNode;
    additionalClasses?: string;
}
