class Logger {
    private readonly prefix: string;
    constructor() {
        this.prefix = `[${new Date().toJSON()}]`
    }
    info(...args: any) {
        return console.info.call(console, this.prefix, ...args);
    }

    warn(...args: any) {
        return console.warn.call(console, this.prefix, ...args);
    }

    log(...args: any) {
        return console.log.call(console, this.prefix, ...args);
    }

    error(...args: any) {
        return console.error.call(console, this.prefix, ...args);
    }

    trace(...args: any) {
        return console.trace.call(console, this.prefix, ...args);
    }
}

export = Logger;
