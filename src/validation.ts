import { Format } from './types';

export function validateFormat(content: string, format: Format): boolean {
  switch (format) {
    case Format.JSON:
      try {
        JSON.parse(content);
        return true;
      } catch (e) {
        return false;
      }
    case Format.Notion:
        try {
            const blocks = JSON.parse(content);
            if (!Array.isArray(blocks)) return false;
            for (const block of blocks) {
                if (!block.object || !block.id || !block.type) {
                    return false;
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    default:
      // For now, we'll assume other formats are valid.
      // More specific validation can be added later.
      return true;
  }
}
