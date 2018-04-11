export interface TSROptions {
  /**
   * @default true
   */
  exitOnError: boolean;

  /**
   * Where to generate js files
   * @default 'tmp/tsreq'
   */
  tmpDir: string;

  extraFiles: string[];

  /**
   * @default null
   */
  projectDir?: string;

  /**
   * Typescript Compiler options
   */
  tscOptions: {
    [k: string]: any;
    // target: "ES5",
    // module: "commonjs",
    // inlineSourceMap: null
  };
}
