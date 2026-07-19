import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';

type Context = {
    correlationId?: string;
    userId?: string;
};

class CorrelationContext {
    private storage = new AsyncLocalStorage<Context>();

    run<T>(callback: () => T | Promise<T>): T | Promise<T> {
        return this.storage.run({}, callback);
    }

    setCorrelationId(correlationId: string) {
        const store = this.storage.getStore();
        if (store) store.correlationId = correlationId;
    }

    getCorrelationId(): string | undefined {
        return this.storage.getStore()?.correlationId ?? 'N/A';
    }

    setUserId(userId: string) {
        const store = this.storage.getStore();
        if (store) store.userId = userId;
    }

    getUserId(): string | undefined {
        return this.storage.getStore()?.userId ?? 'N/A';
    }

    getCorrelationAndUserId(): { correlationId: string; userId: string } {
        return { correlationId: this.getCorrelationId(), userId: this.getUserId() };
    }

    async withCorrelationId<T>(callback: () => T | Promise<T>, correlationId?: string): Promise<T> {
        return this.run(async () => {
            this.setCorrelationId(correlationId ?? uuid());
            return callback();
        });
    }
}

export const correlationContext = new CorrelationContext();
