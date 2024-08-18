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