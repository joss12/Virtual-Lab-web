export interface PyodideInterface {
  runPython: (code: string) => unknown;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
    initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<{
      Database: new (data?: ArrayBuffer) => {
        run: (sql: string) => void;
        exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
      };
    }>;
  }
}
