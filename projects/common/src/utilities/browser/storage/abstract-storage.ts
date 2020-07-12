// A small abstraction on browser's storage for mocking and cleaning up the API a bit
export abstract class AbstractStorage {
  public constructor(private readonly storage: Storage) {}

  public contains(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  public get<T extends string = string>(key: string): T | undefined {
    const value = this.storage.getItem(key);

    return value !== null ? (value as T) : undefined;
  }

  public set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  public delete(key: string): void {
    this.storage.removeItem(key);
  }
}
