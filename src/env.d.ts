declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_VERSION: string
    readonly APP_COMMIT: string
  }
}
