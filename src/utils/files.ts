import fs from 'fs';
import path from 'path';

/**
 * processFileReferences - Scans text for @filename and replaces it with file content.
 */
export async function processFileReferences(text: string): Promise<string> {
  const regex = /@(\S+)/g;
  let result = text;
  const matches = [...text.matchAll(regex)];

  for (const match of matches) {
    const fullMatch = match[0];
    const filename = match[1];
    const filePath = path.resolve(process.cwd(), filename);

    try {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const formattedContent = `\n\n--- File: ${filename} ---\n${content}\n--- END OF FILE ---\n`;
        result = result.replace(fullMatch, formattedContent);
      }
    } catch (error) {
      console.error(`Failed to read file ${filename}:`, error);
    }
  }

  return result;
}
