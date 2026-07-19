import * as crypto from 'crypto';
import { ValidationErrorItem } from 'joi';
import { JwtPayload } from 'jsonwebtoken';
import { ConstantsEnv } from '../core/constants';

export class ResponseError {
    status: number;
    message: string;
    error?: Error;
}

export class DataError {
    collection: string;
    operation: string;
    id?: string;

    constructor(collection: string, operation: string, id?: string) {
        this.collection = collection;
        this.operation = operation;
        this.id = id;
    }
}

export class InvalidError {
    entity: string;
    details: ValidationErrorItem[];

    constructor(entity: string, details: ValidationErrorItem[]) {
        this.entity = entity;
        this.details = details;
    }
}

export interface IDecodedToken extends JwtPayload {
    id?: string;
    role?: string;
}

export namespace Helper {
    export function generateRandomInteger(min: number, max: number) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    export function copyArray<T>(source: T[]): T[] {
        const ret = new Array<T>();

        if (source && source.length > 0) {
            source.forEach((item) => {
                ret.push(item);
            });
        }

        return ret;
    }

    export function compareObjects(x: any, y: any): boolean {
        if (x === y) return true;
        // if both x and y are null or undefined and exactly the same

        if (!(x instanceof Object) || !(y instanceof Object)) return false;
        // if they are not strictly equal, they both need to be Objects

        if (x.constructor !== y.constructor) return false;

        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.

        for (const p in x) {
            if (!Object.prototype.hasOwnProperty.call(x, p)) continue;
            // other properties were tested using x.constructor === y.constructor

            if (!Object.prototype.hasOwnProperty.call(y, p)) return false;
            // allows to compare x[ p ] and y[ p ] when set to undefined

            if (x[p] === y[p]) continue;
            // if they have the same strict value or identity then they are equal

            if (typeof x[p] !== 'object') return false;
            // Numbers, Strings, Functions, Booleans must be strictly equal

            if (!compareObjects(x[p], y[p])) return false;
            // Objects and Arrays must be tested recursively
        }

        for (const p in y) {
            if (Object.prototype.hasOwnProperty.call(y, p) && !Object.prototype.hasOwnProperty.call(x, p)) {
                return false;
            }
        }
        return true;
    }

    export function isTestModeEnabled() {
        return ConstantsEnv.Main.APP_MODE !== ConstantsEnv.APP_MODES.PRODUCTION;
    }

    export function removePassword(payload: any) {
        const { password, ...rest } = payload;
        return rest;
    }

    export function sort(data: any[], sortBy: string, type: string = 'ASC') {
        return [...data].sort((a, b) => {
            const dateA: any = new Date(a ? a[sortBy] : a[sortBy]);
            const dateB: any = new Date(b ? b[sortBy] : b[sortBy]);

            return type === 'ASC' ? dateA - dateB : dateB - dateA;
        });
    }

    export function generateRandomString() {
        return crypto.randomBytes(6).toString('utf-8');
    }

    export function prepareTableName(originalName: string) {
        const { DB_TABLE_PREFIX } = ConstantsEnv.Mongodb;
        return DB_TABLE_PREFIX ? `${DB_TABLE_PREFIX}-${originalName}` : originalName;
    }

    export function generateHumanReadableCode() {
        return Number('0x' + crypto.randomBytes(4).toString('hex'));
    }

    export function enumToObject<T extends Record<string, V>, V extends string>(e: T): { [key in V]: V } {
        return Object.keys(e).reduce(
            (obj, key) => {
                obj[e[key]] = e[key];
                return obj;
            },
            {} as { [key in V]: V }
        );
    }

    export function findObjectDifferencesWithPattern(obj1Pattern: Record<string, any>, obj2: Record<string, any>) {
        const differences: Record<string, any> = {};

        for (const key in obj1Pattern) {
            if (Object.prototype.hasOwnProperty.call(obj2, key) && obj1Pattern[key] !== obj2[key]) {
                differences[key] = obj2[key];
            }
        }

        return differences;
    }

    export function isNumber(val: any): boolean {
        return typeof val === 'number' && !isNaN(val);
    }

    export function createPackets<T>(list: T[], packetSize: number): T[][] {
        const packets: T[][] = [];
        let packet: T[] = [];

        for (const item of list) {
            packet.push(item);
            if (packet.length === packetSize) {
                packets.push([...packet]);
                packet = [];
            }
        }
        if (packet.length > 0) {
            packets.push(packet);
        }

        return packets;
    }

    export function removeDuplicatesByKey<T, K>(array: T[], keySelector: (item: T) => K): T[] {
        const seen = new Set<K>();
        return array.filter((item) => {
            const key = keySelector(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}
