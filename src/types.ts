export interface IDisposable {
  dispose: () => void;
}

export function arrayify(o: any): any[] {
  return o ? (Array.isArray(o) ? o : [o]) : [];
}