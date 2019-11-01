/**
 * @class Logger
 */
enum LEVEL {
    silent = 0, //silent No Log
    basic = 1 //Basic Log
}

enum colors {
    DEBUG = "#0000FF",
    SUCCESS = "#006700",
}

export default class Logger {

    private LogLevel: number;

    constructor(level: number = LEVEL.basic) {
        this.LogLevel = level;
    }


    public warning(message: string) {
        const timestamp = '[' + new Date().toUTCString() + '] ';
        const currentLogLevel = this.LogLevel;

        if (currentLogLevel > LEVEL.silent)
            console.warn(timestamp + " " + message);

    }

    public success(message: string) {
        const timestamp = '[' + new Date().toUTCString() + '] ';
        const css = "color:" + colors.SUCCESS;;
        const currentLogLevel = this.LogLevel;

        if (currentLogLevel > LEVEL.silent)
            console.log("%c" + timestamp + " " + message, css);

    }

    public error(message: string) {
        const currentLogLevel = this.LogLevel;

        if (currentLogLevel > LEVEL.silent)
            throw new Error(message);
    }

    public debug(message: string) {
        const timestamp = '[' + new Date().toUTCString() + '] ';
        const css = "color:" + colors.DEBUG;
        const currentLogLevel = this.LogLevel;

        if (currentLogLevel > LEVEL.silent)
            console.log("%c" + timestamp + " " + message, css);

    }



}