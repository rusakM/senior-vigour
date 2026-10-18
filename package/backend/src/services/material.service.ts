import { dbConnector } from '../core';
import * as model from '../models/Material';
export import Model = model;
import { ConstantsGlobal, ConstantsCourse } from '../core/constants';

class dbConnectorMaterial extends dbConnector<Model.IDBMaterial, Model.IMaterial, Model.TIndexes> {
    constructor() {
        super(Model.Material);
    }
}

export const DB = new dbConnectorMaterial();
