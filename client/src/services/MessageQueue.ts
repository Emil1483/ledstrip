export class MessageQueue<T> {
    private queue: T[] = [];
    private resolvers: ((value: T) => void)[] = [];

    enqueue(message: T) {
        if (this.resolvers.length > 0) {
            const resolve = this.resolvers.shift();
            if (resolve) {
                resolve(message);
            }
        } else {
            this.queue.push(message);
        }
    }

    dequeue(): Promise<T> {
        return new Promise((resolve) => {
            if (this.queue.length > 0) {
                resolve(this.queue.shift()!);
            } else {
                this.resolvers.push(resolve);
            }
        });
    }

    clear() {
        this.queue = [];
        this.resolvers = [];
    }
}
