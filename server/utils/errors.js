export class AppError extends Error {
    constructor(message, code, fatal = false) {
        super(message)
        this.code = code
        this.fatal = fatal
    }
}