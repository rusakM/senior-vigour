import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from '.';
import { ConstantsGlobal, ConstantsCourse } from '../core/constants';

interface IMaterialBasic {
    category: ConstantsCourse.Module.CATEGORY;
    languages: { [key in ConstantsGlobal.App.USER_INTERFACE_LANGUAGES]: {
        fileExtension: string;
        name: string;
        pages: number;
    }};
    name: string;
    translation: string;
    type: ConstantsCourse.Material.TYPES_ENUM;
}

export interface IMaterial extends IMaterialBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBMaterial extends IMaterialBasic, Document {}

const MaterialSchema = new Schema<IDBMaterial>(
    {
        category: {
            type: String,
            required: true,
            enum: Object.values(ConstantsCourse.Module.CATEGORY),
        },
        languages: {
            type: Object.fromEntries(
                Object.values(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES).map((lang) => [
                    lang,
                    {
                        fileExtension: {
                            type: String
                        },
                        name: {
                            type: String
                        },
                        pages: {
                            type: Number,
                            default: 0,
                            min: 0
                        }
                    },
                ])
            ),
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        translation: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(ConstantsCourse.Material.TYPES_ENUM)
        }
    },
    SchemasGlobal.Options.dbSchema
);

MaterialSchema.index({ category: 1 });
MaterialSchema.index({ type: 1 });
MaterialSchema.index({ name: 1 }, { unique: true });
MaterialSchema.index({ category: 1, type: 1 });

export type TIndexes = 'category' | 'type' | 'name';

export const Material = model<IDBMaterial>(Helper.prepareTableName('material'), MaterialSchema);
