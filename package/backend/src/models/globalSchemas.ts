import Joi from 'joi';
import { SchemaDefinition, SchemaOptions } from 'mongoose';

export namespace Fields {
    export namespace File {
        export namespace Simple {
            export interface ISimpleFile {
                key?: string;
                url?: string;
            }

            export const validators = {
                url: Joi.string().optional().allow(''),
                key: Joi.string().optional().allow(''),
            };

            export const mainValidator = Joi.object().keys(validators);

            export const dbSchema: SchemaDefinition = {
                key: {
                    type: String,
                    validate: (val: any) => !validators.key.validate(val).error,
                },
                url: {
                    type: String,
                    validate: (val: any) => !validators.url.validate(val).error,
                },
            };
        }

        export namespace Image {
            export interface IImageFile {
                name?: string;
                original?: File.Simple.ISimpleFile;
                thumbnail?: File.Simple.ISimpleFile;
                type?: string;
            }

            export const validators = {
                original: Joi.object().keys(Simple.validators),
                thumbnail: Joi.object().keys(Simple.validators),
                name: Joi.string().optional().allow(''),
                type: Joi.string().optional().allow(''),
            };

            export const mainValidator = Joi.object().keys(validators);

            export const dbSchema: SchemaDefinition = {
                name: String,
                original: Simple.dbSchema,
                thumbnail: Simple.dbSchema,
                type: String,
            };
        }
    }
}

export namespace Options {
    export const virtuals: SchemaOptions = {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    };

    export const timestamps: SchemaOptions = {
        timestamps: true,
    };

    export const dbSchema: SchemaOptions = {
        ...virtuals,
        ...timestamps,
        strict: false,
    };
}

export namespace Schemas {
    export interface IDocumentBasic {
        _id?: string;
        __v?: number;
    }

    export interface ITimestamps {
        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface IDocument extends IDocumentBasic, ITimestamps {}
}

export namespace Validators {
    export function schemaValidator(validator: Joi.Schema, val: any): boolean {
        const err = validator.validate(val).error;
        if (err) {
            console.error('Schema validation error!!!');
            console.log(JSON.stringify(err));
        }

        return !err;
    }
}
