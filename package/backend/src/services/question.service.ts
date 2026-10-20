import { dbConnector } from '../core';
import * as model from '../models/Question';
export import Model = model;

class dbConnectorQuestion extends dbConnector<
    Model.IDBQuestion,
    Model.IQuestion,
    Model.TIndexes
> {
    constructor() {
        super(Model.Question);
    }
}

export const DB = new dbConnectorQuestion();

export namespace Helpers {
    export async function getAllSorted(): Promise<Model.IQuestion[]> {
        const questions = (await DB.Get.all()) ?? [];
        return [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
    }

    export async function getByQuestionNumber(
        questionNumber: number
    ): Promise<Model.IQuestion | null> {
        const results = await DB.Find.byQuery({ questionNumber }, 1);
        return results?.[0] ?? null;
    }
}
