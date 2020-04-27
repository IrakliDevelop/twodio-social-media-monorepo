export class SignupRequiredError extends Error {
  // @ts-ignore
  constructor(
    public code = 'signup_required',
    public message = 'Signup Required'
  ) {
    super(message);
    this.code = code;

    Error.captureStackTrace(this, SignupRequiredError);
  }
}
