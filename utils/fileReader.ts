import * as pdfjsLib from 'pdfjs-dist';

// Set workerSrc to load the PDF worker script from the CDN.
// This is required by pdf.js to process PDFs in a separate thread.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

/**
 * Reads a PDF file and extracts its text content from all pages.
 * @param file - The PDF file to read.
 * @returns A promise that resolves to the full text content of the PDF.
 */
const readPdfAsText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        fullText += pageText + '\n\n'; // Add newline between pages for clarity
    }

    return `\n--- START OF FILE: ${file.name} ---\n${fullText}\n--- END OF FILE: ${file.name} ---\n`;
};


/**
 * Reads an array of `File` objects and returns their combined text content as a single string.
 * This is used to prepare user-uploaded context files to be sent to the AI.
 * It now supports both text-based files and PDFs.
 * 
 * @param files - An array of `File` objects, typically from an `<input type="file">` element.
 * @returns A promise that resolves to a single string containing the content of all files,
 *          with each file's content wrapped in a separator that includes its name.
 */
export const readFilesAsText = (files: File[]): Promise<string> => {
  // Create an array of promises, one for each file to be read.
  const fileReadPromises = Array.from(files).map(file => {
    // If the file is a PDF, use the dedicated PDF reader.
    if (file.type === 'application/pdf') {
        return readPdfAsText(file);
    }
    
    // Otherwise, use the standard FileReader for text-based files.
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