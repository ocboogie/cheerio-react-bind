export default class TagError extends Error {
  public error: Error;
  public location: string;

  public constructor(err: Error, location: string) {
    super();

    this.name = "TagError";
    this.error = err;
    this.location = location;
    this.message = `There was an error rendering a tag at "${
      this.location
    }": "${err}"`;

    Object.setPrototypeOf(this, new.target.prototype); // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html :kissing:
    Error.captureStackTrace(this, this.constructor);
  }
}
