import { readFile, access, constants } from 'node:fs/promises';

export async function checkExist(location: string): Promise<boolean> {
    return await access(location, constants.R_OK)
        .then(() => true)
        .catch(() => false);
}

export async function read(location: string): Promise<string> {
    try {
        if (await checkExist(location)) {
            return await readFile(location, 'utf-8');
        }
        return null;
    } catch {
        return null;
    }
}
