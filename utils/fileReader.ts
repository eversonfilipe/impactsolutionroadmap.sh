/**
 * Reads an array of `File` objects and returns their combined text content as a single string.
 * This is used to prepare user-uploaded context files to be sent to the AI.
 * 
 * @param files - An array of `File` objects, typically from an `<input type="file">` element.
 * @returns A promise that resolves to a single string containing the content of all files,
 *          with each file's content wrapped in a separator that includes its name.
 */
export const readFilesAsText = (files: File[]): Promise<string> => {
  // Create an array of promises, one for each file to be read.
  const fileReadPromises = Array.from(files).map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      // The 'onload' event fires when the file has been successfully read.
      reader.onload = () => {
        // We wrap the file content with separators that include the filename.
        // This gives the AI clear context about where each piece of information comes from.
        const content = `\n--- START OF FILE: ${file.name} ---\n${reader.result}\n--- END OF FILE: ${file.name} ---\n`;
        resolve(content);
      };

      // The 'onerror' event fires if there's an issue reading the file.
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      
      // Start the file reading process.
      reader.readAsText(file);
    });
  });

  // `Promise.all` waits for all file reading promises to resolve.
  // Once they are all complete, we join the contents into a single string.
  return Promise.all(fileReadPromises).then(contents => contents.join('\n'));
};
