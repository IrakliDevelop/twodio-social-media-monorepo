export class ValidationError extends Error {
    constructor(...args: any) {
        super(...args);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, ValidationError);
    }
}

