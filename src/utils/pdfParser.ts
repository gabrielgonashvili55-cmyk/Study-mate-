import * as pdfjsLib from 'pdfjs-dist';
import { DocumentPage } from '../types';

// Set up PDF worker URL cleanly
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('PDF.js worker initialization warning:', err);
  }
}

export interface ParsePdfProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  stage: string;
}

export interface ParsedPdfResult {
  title: string;
  pageCount: number;
  rawText: string;
  pages: DocumentPage[];
  fileSize: number;
}

/**
 * Extracts all text from a PDF file in the browser without sending it anywhere.
 * Supports large documents with progressive chunking and memory efficiency.
 */
export async function parsePdfFile(
  file: File,
  onProgress?: (progress: ParsePdfProgress) => void
): Promise<ParsedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    percentage: 5,
    stage: 'Loading PDF document...',
  });

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const pages: DocumentPage[] = [];
  const fullTextChunks: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Stitch text items together with natural spacing
    let lastY: number | null = null;
    let pageText = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        // If Y position jumped downwards, insert newline
        const currentY = 'transform' in item ? (item.transform as number[])[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        pageText += item.str;
        if (currentY !== null) {
          lastY = currentY;
        }
      }
    }

    // Clean up excessive whitespace
    const cleanedPageText = pageText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    
    pages.push({
      pageNumber: pageNum,
      text: cleanedPageText,
    });
    fullTextChunks.push(`--- Page ${pageNum} ---\n` + cleanedPageText);

    const percentage = Math.round(10 + (pageNum / totalPages) * 85);
    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percentage,
      stage: `Extracting text from page ${pageNum} of ${totalPages}...`,
    });

    // Small yield every 10 pages to keep browser UI reactive on large PDFs
    if (pageNum % 10 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  const rawText = fullTextChunks.join('\n\n');
  const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    percentage: 100,
    stage: 'Extraction complete!',
  });

  return {
    title: cleanTitle,
    pageCount: totalPages,
    rawText,
    pages,
    fileSize: file.size,
  };
}
