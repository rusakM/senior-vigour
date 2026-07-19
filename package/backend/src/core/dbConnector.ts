import { Model, Document, QueryFilter, Types } from 'mongoose';
import { RedisConnector } from './redisConnector';
import * as SchemasGlobal from '../models/globalSchemas';

/**
 * Interface representing the core methods of a database connector.
 * @template IDBModel - The type of the model document.
 * @template IModel - Inteface of the document in db.
 * @template TIndexes - The type of the indexes used in queries.
 */
export interface IDbConnector<IModel extends SchemasGlobal.Schemas.IDocument, TIndexes extends string> {
    /**
     * Creates a new document in the database.
     * @param payload - The data to create the document with.
     * @returns The created document or null if creation failed.
     */
    create: (payload: IModel) => Promise<IModel | null>;
    /**
     * Creates a new documents in the database.
     * @param payload - The array of data to create the documents with.
     * @returns The created document or null if creation failed.
     */
    createMany: (payload: IModel[]) => Promise<IModel[] | null>;
    /**
     * Creates a new document in the database or update if exists.
     * @param payload - The data to create the document with.
     * @returns The created document or null if creation failed.
     */
    createOrUpdate: (payload: IModel) => Promise<IModel | null>;

    /**
     * Updates an existing document by its ID.
     * @param id - The ID of the document to update.
     * @param payload - The data to update the document with.
     * @returns The updated document or null if the update failed.
     */
    update: (id: string, payload: IModel) => Promise<IModel | null>;

    /**
     * Deletes a document by its ID.
     * @param id - The ID of the document to delete.
     * @returns A boolean indicating whether the deletion was successful.
     */
    delete: (id: string) => Promise<boolean>;

    /**
     * Methods for finding documents in the database.
     */
    Find: IFindMethods<IModel, TIndexes>;

    /**
     * Methods for retrieving documents without conditions.
     */
    Get: IGetMethods<IModel>;

    /**
     * Additional methods for more complex database operations.
     */
    AdditionalMethods: IAdditionalMethods<TIndexes>;
}

/**
 * Interface representing various find methods.
 * @template IModel - The type of the model document.
 * @template TIndexes - The type of the indexes used in queries.
 */
interface IFindMethods<IModel, TIndexes extends string> {
    /**
     * Finds a document by its ID.
     * @param id - The ID of the document to find.
     * @returns The document or null if not found.
     */
    byId: (id: string) => Promise<IModel | null>;

    /**
     * Finds documents by a specified index and value.
     * @param key - The index to search by.
     * @param value - The value to match against the index.
     * @param limit - Optional limit on the number of documents to return.
     * @returns An array of matching documents.
     */
    byIndex: {
        (key: TIndexes, value: string, limit: 1): Promise<IModel | null>;
        (key: TIndexes, value: string, limit?: number): Promise<IModel[] | null>;
    };

    /**
     * Finds documents matching the given query conditions.
     * @param conditions - The query conditions to match.
     * @param limit - Optional limit on the number of documents to return.
     * @returns An array of matching documents.
     */
    byQuery: (conditions: QueryFilter<IModel>, limit?: number) => Promise<IModel[]>;

    /**
     * Finds documents within a specified date range.
     * @param key - The key representing the date field.
     * @param startDate - The start date of the range.
     * @param endDate - The end date of the range.
     * @returns An array of matching documents.
     */
    byDateRange: (key: string, startDate: Date, endDate: Date) => Promise<IModel[]>;

    /**
     * Finds documents matching multiple key-value pairs.
     * @param keys - An object representing key-value pairs to match.
     * @returns An array of matching documents.
     */
    byMultipleKeys: (keys: { [key in TIndexes]?: string }) => Promise<IModel[]>;
}

/**
 * Interface representing methods to retrieve documents without specific conditions.
 * @template IModel - The type of the model document.
 */
interface IGetMethods<IModel> {
    /**
     * Retrieves all documents in the collection.
     * @returns An array of all documents.
     */
    all: () => Promise<IModel[]>;
}

/**
 * Interface representing additional methods for complex database operations.
 * @template TIndexes - The type of the indexes used in queries.
 */
interface IAdditionalMethods<TIndexes extends string> {
    /**
     * Counts the number of documents that match the specified index and value.
     * @param key - The index to search by.
     * @param value - The value to match against the index.
     * @returns The count of matching documents.
     */
    countBy: (key: TIndexes, value: string) => Promise<number>;
}

export class DbConnector<IDBModel extends Document, IModel extends SchemasGlobal.Schemas.IDocument, TIndexes extends string> implements IDbConnector<IModel, TIndexes> {
    protected Model: Model<IDBModel>;
    protected errorMsg: string;

    public constructor(ModelDB: Model<IDBModel>) {
        this.Model = ModelDB;
        this.errorMsg = `Error db (collection: ${this.Model.collection.name}) - `;
    }

    public async create(payload: IModel): Promise<IModel | null> {
        try {
            //@ts-ignore
            return (await this.Model.create(payload)) as unknown as IModel;
        } catch (error) {
            console.log(`${this.errorMsg} payload: `, JSON.stringify(payload));
            console.error(`${this.errorMsg} creating item:`, error);
            return null;
        }
    }

    public async createMany(payload: IModel[]): Promise<IModel[] | null> {
        try {
            return (await this.Model.insertMany(payload)) as unknown as IModel[];
        } catch (error) {
            console.log(`${this.errorMsg} payload: `, JSON.stringify(payload));
            console.error(`${this.errorMsg} creating item:`, error);
            return null;
        }
    }

    public async createOrUpdate(payload: IModel): Promise<IModel | null> {
        try {
            const doc: IModel & { _id: string } = await this.Model.findOne(payload);
            return doc ? await this.update(doc._id, payload) : await this.create(payload);
        } catch (error) {
            console.log(`${this.errorMsg} payload: `, JSON.stringify(payload));
            console.error(`${this.errorMsg} creating item:`, error);
            return null;
        }
    }

    public async update(id: string, payload: IModel): Promise<IModel | null> {
        try {
            if (!Types.ObjectId.isValid(id)) throw new Error('"id" is not valid.');
            return (await this.Model.findByIdAndUpdate(id, payload, { new: true }).lean().exec()) as IModel;
        } catch (error) {
            console.log(`${this.errorMsg} update (id: ${id}):`, JSON.stringify(payload));
            console.error('Error updating item:', error);
            return null;
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) throw new Error('"id" is not valid.');
            const deletedItem = await this.Model.findByIdAndDelete(id).exec();
            return !!deletedItem;
        } catch (error) {
            console.error(`${this.errorMsg} deleting item (id: ${id}):`, error);
            return false;
        }
    }

    public Find: IFindMethods<IModel, TIndexes> = {
        byId: async (id: string): Promise<IModel> => {
            try {
                return (await this.Model.findById(id).lean().exec()) as IModel;
            } catch (error) {
                console.error(`${this.errorMsg} finding by id (id: ${id}):`, error);
                return null;
            }
        },
        //@ts-ignore
        byIndex: async (key: TIndexes, value: string, limit: number = 0) => {
            try {
                if (!value) throw new Error(`Value "${value}" for ${key} is required.`);
                const filter: QueryFilter<IDBModel> = { [key]: value } as QueryFilter<IDBModel>;
                const query = this.Model.find(filter);
                if (limit > 0) query.limit(limit);
                if (limit === 1) return (await query.lean().exec())?.[0] as unknown as IModel;
                return (await query.lean().exec()) as unknown as IModel[];
            } catch (error) {
                console.error(`${this.errorMsg} byIndex (key: ${key}, value: ${value}):`, error);
                return limit === 1 ? null : [];
            }
        },
        byQuery: async (conditions: QueryFilter<IModel>, limit: number = 0): Promise<IModel[]> => {
            try {
                const query = this.Model.find(conditions as QueryFilter<IDBModel>);
                if (limit > 0) query.limit(limit);
                return <IModel[]>await query.lean().exec();
            } catch (error) {
                console.error(`${this.errorMsg} byQuery conditions:`, error);
                return [];
            }
        },
        byDateRange: async (key: keyof IModel & string, startDate: Date, endDate: Date): Promise<IModel[]> => {
            try {
                if (typeof key !== 'string') throw new Error(`Key "${key}" is not a valid string key.`);
                const query: QueryFilter<IDBModel> = {
                    [key]: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                } as QueryFilter<IDBModel>;
                return <IModel[]>await this.Model.find(query).lean().exec();
            } catch (error) {
                console.error(`${this.errorMsg} byDateRange key: ${key}, startDate: ${startDate}, endDate: ${endDate}`);
                return [];
            }
        },
        byMultipleKeys: async (keys: { [key in TIndexes]?: string }): Promise<IModel[]> => {
            try {
                const query: QueryFilter<IDBModel> = {} as QueryFilter<IDBModel>;
                for (const key in keys) {
                    if (Object.prototype.hasOwnProperty.call(keys, key)) {
                        if (this.Model.schema.paths[key]) {
                            //@ts-ignore
                            query[key as keyof IDBModel] = keys[key] as any;
                        } else {
                            throw new Error(`Key "${key}" is not a valid field in the model.`);
                        }
                    }
                }
                return <IModel[]>await this.Model.find(query).lean().exec();
            } catch (error) {
                console.error(`${this.errorMsg} byMultipleKeys keys: `, JSON.stringify(keys));
                return [];
            }
        },
    };

    public Get: IGetMethods<IModel> = {
        all: async (): Promise<IModel[]> => {
            try {
                return <IModel[]>await this.Model.find().lean().exec();
            } catch (error) {
                console.error(`${this.errorMsg} Get All:`, error);
                return [];
            }
        },
    };

    public AdditionalMethods: IAdditionalMethods<TIndexes> = {
        countBy: async (key: TIndexes, value: string): Promise<number> => {
            try {
                if (!this.Model.schema.paths[key]) {
                    throw new Error(`Key "${key}" is not a valid field in the model.`);
                }
                const query: QueryFilter<IDBModel> = {
                    [key]: value as any,
                } as QueryFilter<IDBModel>;
                const count = await this.Model.countDocuments(query).exec();
                return count;
            } catch (error) {
                console.error(`${this.errorMsg} countBy (key: ${key}, value: ${value}):`, error);
                return 0;
            }
        },
    };
}

export type TRecordUpdateMode = 'CACHE' | 'CACHE_AND_DB' | 'DB';
interface IDbConnectorCache<IModel extends SchemasGlobal.Schemas.IDocument> {
    create: (payload: IModel, useCache?: boolean) => Promise<IModel | null>;
    createMany: (payload: IModel[], useCache?: boolean) => Promise<IModel[] | null>;
    createOrUpdate: (payload: IModel, useCache?: boolean) => Promise<IModel | null>;
    update: (id: string, payload: IModel, updateMode?: TRecordUpdateMode) => Promise<IModel | null>;
    delete: (id: string, useCache?: boolean) => Promise<boolean>;
    deleteFromCache: (id: string) => Promise<boolean>;
}

interface IFindMethodsCacheExtended<IModel extends SchemasGlobal.Schemas.IDocument, TIndexes extends string> extends IFindMethods<IModel, TIndexes> {
    byId: (id: string, useCache?: boolean) => Promise<IModel>;

    byIndex: {
        (key: TIndexes, value: string, limit: 1, useCache?: boolean): Promise<IModel | undefined>;
        (key: TIndexes, value: string, limit?: number, useCache?: boolean): Promise<IModel[]>;
    };
}

export class DbConnectorCache<IDBModel extends Document, IModel extends SchemasGlobal.Schemas.IDocument, TIndexes extends string> extends DbConnector<IDBModel, IModel, TIndexes> implements IDbConnectorCache<IModel> {
    private cache: RedisConnector<IModel>;

    public constructor(ModelDB: Model<IDBModel>, cacheKey: string, cacheTtl?: number) {
        super(ModelDB);
        this.cache = new RedisConnector<IModel>(cacheKey, cacheTtl);
    }

    public async create(payload: IModel, useCache: boolean = true): Promise<IModel | null> {
        try {
            const result = (await super.create(payload)) as IModel;
            if (!useCache) return result;
            return await this.cache.save(result?._id, result);
        } catch (error) {
            console.error(`${this.errorMsg} creating item with cache:`, error);
            return null;
        }
    }

    public async createMany(payload: IModel[], useCache: boolean = true): Promise<IModel[] | null> {
        try {
            const results = await super.createMany(payload);
            if (!useCache) return results;
            return await Promise.all(results.map(async (result) => await this.cache.save(result?._id, result)));
        } catch (error) {
            console.error(`${this.errorMsg} creating many items with cache:`, error);
            return null;
        }
    }

    public async createOrUpdate(payload: IModel, useCache: boolean = true): Promise<IModel | null> {
        try {
            const result = await super.createOrUpdate(payload);
            if (!useCache) return result;
            return await this.cache.save(result?._id, result);
        } catch (error) {
            console.error(`${this.errorMsg} creating or updating item with cache:`, error);
            return null;
        }
    }

    public async update(id: string, payload: IModel, updateMode: TRecordUpdateMode = 'CACHE_AND_DB'): Promise<IModel | null> {
        try {
            const { createdAt, updatedAt, __v, _id, ...updateData } = payload;
            let updatedItem: IModel;

            if (updateMode !== 'CACHE') updatedItem = await super.update(id, updateData as IModel);
            else updatedItem = { ...(await this.Find.byId(id)), ...updateData };
            if (updateMode !== 'DB') await this.cache.save(id, updatedItem);
            return updatedItem;
        } catch (error) {
            console.error(`${this.errorMsg} updating item with cache:`, error);
            return null;
        }
    }

    public async delete(id: string, useCache: boolean = true): Promise<boolean> {
        try {
            const result = await super.delete(id);
            if (!useCache) return result;
            return await this.cache.delete(id);
        } catch (error) {
            console.error(`${this.errorMsg} deleting item with cache:`, error);
            return false;
        }
    }

    public async deleteFromCache(id: string): Promise<boolean> {
        try {
            return await this.cache.delete(id);
        } catch (error) {
            console.error(`${this.errorMsg} deleting item with cache:`, error);
            return false;
        }
    }

    public Find: IFindMethodsCacheExtended<IModel, TIndexes> = {
        //@ts-ignore
        ...this.Find,
        byId: async (id: string, useCache: boolean = true): Promise<IModel> => {
            try {
                if (useCache) {
                    const cachedResult = await this.cache.get(id);
                    if (cachedResult) return cachedResult;
                }

                const result = await this.Find.byId(id);
                if (result && useCache) await this.cache.save(id, result);
                return result;
            } catch (error) {
                console.error(`${this.errorMsg} finding by id with cache (id: ${id}):`, error);
                return null;
            }
        },
    };
}
