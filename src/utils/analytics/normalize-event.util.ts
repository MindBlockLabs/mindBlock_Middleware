import { EventType } from '../../common/enums/event-type.enum';

export function normalizeEvent(input: Record<string, any>): Record<string, any> {
  if (!Object.values(EventType).includes(input.eventType)) {
    throw new Error(`Invalid eventType: ${input.eventType}`);
  }

  const output: Record<string, any> = {};

  function flatten(obj: any, prefix = '') {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        flatten(value, newKey);
      } else if (key === 'createdAt') {
        output[newKey] = new Date(value).toISOString();
      } else {
        output[newKey] = value;
      }
    }
  }

  flatten(input);
  return output;
}
