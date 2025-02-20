type AnyObject = { [key: string]: any };

export function prepareSettingsInputData<T>(obj: T): T {
  if (obj !== null && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item) => prepareSettingsInputData(item)) as unknown as T;
    } else {
      const newObj: Partial<T> = {};
      for (const key in obj) {
        if (key !== '__typename') {
          (newObj as AnyObject)[key] = prepareSettingsInputData(
            (obj as AnyObject)[key],
          );
        }
      }
      return newObj as T;
    }
  }
  return obj;
}
