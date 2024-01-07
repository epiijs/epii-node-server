import { IAppConfig } from '@epiijs/config';

type ContextHookFn<P = void> = (self: P, ...args: any[]) => unknown;

interface IContextInner {
  install: <P = void>(key: string, hook: ContextHookFn<P>, self: P) => void;
  resolve: () => unknown;
  dispose: () => void;
}

export function buildContext(): IContextInner {
  const methods: Record<string, unknown> = {};

  const context: Partial<IContextInner> = {};

  context.install = <P>(key: string, hook: ContextHookFn<P>, self: P): void => {
    methods[key] = (...args: unknown[]) => hook(self, ...args);
  };

  context.resolve = () => {
    return new Proxy({}, {
      get: (_, name) => {
        if (typeof name === 'string') {
          return methods[name];
        }
        return undefined;
      }
    });
  };

  context.dispose = () => {
    Object.keys(methods).map(key => {
      delete methods[key];
    });
  };

  return context as IContextInner;
}

export function getVerboseOutput(config: IAppConfig): (...args: unknown[]) => void {
  if (!config.flag['verbose']) {
    return (): void => {};
  }
  return (...args: unknown[]): void => {
    console.log(...args);
  }
}

export async function importModule(fileName: string): Promise<unknown> {
  const maybeModule = await import(fileName) as {
    __esModule?: boolean;
    default?: unknown;
  };
  if (maybeModule.__esModule) {
    return maybeModule.default;
  }
  return maybeModule as unknown;
}

export type {
  IContextInner
};
