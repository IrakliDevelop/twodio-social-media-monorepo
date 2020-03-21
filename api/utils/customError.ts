export class CustomError extends Error {
    private details: any;
    private status: any;
    private code: any;
    constructor({ message, status, code }) {
        super(message);

        this.details = message;
        this.status = status;
        this.code = code;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, CustomError);
    }
}

