/* A TypeScript implementation of C++ std::queue */
export class Queue<T> {
    private list: T[] = [];

    constructor(array?: T[]) {
        if(array) this.list = array;
    }

    public empty() {
        return this.list.length === 0;
    }

    public size() {
        return this.list.length;
    }

    public front() {
        return this.list[0];
    }

    public back() {
        return this.list[this.list.length - 1];
    }

    public push(element: T) {
        this.list.push(element);
    }

    public pop() {
        this.list.shift();
    }
}
