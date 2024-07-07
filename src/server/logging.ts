import { IAppConfig } from '@epiijs/config';

export function buildLogging(config: IAppConfig): (...args: unknown[]) => void {
  if (!config.flag['verbose']) {
    return (): void => {};
  }
  return (...args: unknown[]): void => {
    console.log(...args);
  }
}