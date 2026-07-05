import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface BlankPageConfig {
  size: 'A4' | 'Letter';
  orientation: 'Portrait' | 'Landscape';
  backgroundType: 'Blank' | 'Lined' | 'Grid' | 'Dotted';
  pageName?: string;
}

export async function mergePdfs(baseFile: File, newFile: File): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const newBytes = await newFile.arrayBuffer();

  const basePdf = await PDFDocument.load(baseBytes);
  const newPdf = await PDFDocument.load(newBytes);

  const copiedPages = await basePdf.copyPages(newPdf, newPdf.getPageIndices());
  copiedPages.forEach((page) => basePdf.addPage(page));

  const mergedPdfBytes = await basePdf.save();
  return new File([mergedPdfBytes], `Merged_${baseFile.name}`, { type: 'application/pdf' });
}

export async function imagesToPdf(images: File[]): Promise<File> {
  const pdfDoc = await PDFDocument.create();

  for (const image of images) {
    const imageBytes = await image.arrayBuffer();
    
    let embeddedImage;
    if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } else if (image.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      console.warn(`Unsupported image type: ${image.type}. Skipping.`);
      continue;
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes], `Converted_Images_${Date.now()}.pdf`, { type: 'application/pdf' });
}

export async function appendBlankPage(baseFile: File, config: BlankPageConfig): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  
  let width = config.size === 'A4' ? 595.28 : 612;
  let height = config.size === 'A4' ? 841.89 : 792;
  
  if (config.orientation === 'Landscape') {
    const temp = width;
    width = height;
    height = temp;
  }
  
  const page = pdfDoc.addPage([width, height]);
  
  // Draw Backgrounds
  const lineColor = rgb(0.8, 0.8, 0.85);
  const spacing = 20;
  
  if (config.backgroundType === 'Lined') {
    for (let y = spacing; y < height; y += spacing) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, thickness: 0.5, color: lineColor });
    }
  } else if (config.backgroundType === 'Grid') {
    for (let y = spacing; y < height; y += spacing) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, thickness: 0.5, color: lineColor });
    }
    for (let x = spacing; x < width; x += spacing) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, thickness: 0.5, color: lineColor });
    }
  } else if (config.backgroundType === 'Dotted') {
    const dotColor = rgb(0.7, 0.7, 0.75);
    for (let y = spacing; y < height; y += spacing) {
      for (let x = spacing; x < width; x += spacing) {
        page.drawCircle({ x, y, size: 0.7, color: dotColor, borderColor: dotColor });
      }
    }
  }
  
  if (config.pageName) {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText(config.pageName, {
      x: 30,
      y: height - 40,
      size: 16,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }
  
  const updatedBytes = await pdfDoc.save();
  return new File([updatedBytes], baseFile.name, { type: 'application/pdf' });
}

export async function duplicatePdfPage(baseFile: File, pageNumberToDuplicate: number): Promise<File> {
  return duplicatePdfPages(baseFile, [pageNumberToDuplicate]);
}

export async function duplicatePdfPages(baseFile: File, pageNumbersToDuplicate: number[]): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  
  // Sort descending so inserting doesn't shift the indices of subsequent pages we want to duplicate
  const sortedPages = [...pageNumbersToDuplicate].sort((a, b) => b - a);
  
  for (const pageNumber of sortedPages) {
    const pageIndex = pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
      const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [pageIndex]);
      pdfDoc.insertPage(pageIndex + 1, copiedPage);
    }
  }
  
  const updatedBytes = await pdfDoc.save();
  return new File([updatedBytes], baseFile.name, { type: 'application/pdf' });
}

export async function reorderPdfPages(baseFile: File, newOrder: number[]): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  
  const newPdfDoc = await PDFDocument.create();
  // pdf-lib is 0-indexed, newOrder is 1-indexed
  const zeroIndexedOrder = newOrder.map(n => n - 1);
  
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, zeroIndexedOrder);
  copiedPages.forEach(page => newPdfDoc.addPage(page));
  
  const updatedBytes = await newPdfDoc.save();
  return new File([updatedBytes], baseFile.name, { type: 'application/pdf' });
}

export async function deletePdfPages(baseFile: File, pagesToDelete: number[]): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  
  // Sort descending so splicing doesn't mess up subsequent indices
  const zeroIndexedSorted = [...pagesToDelete].map(n => n - 1).sort((a, b) => b - a);
  
  for (const pageIndex of zeroIndexedSorted) {
    if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
      pdfDoc.removePage(pageIndex);
    }
  }
  
  const updatedBytes = await pdfDoc.save();
  return new File([updatedBytes], baseFile.name, { type: 'application/pdf' });
}

export async function rotatePdfPages(baseFile: File, pagesToRotate: number[], angleDegrees = 90): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  
  for (const pageIndex of pagesToRotate.map(n => n - 1)) {
    if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
      const page = pdfDoc.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + angleDegrees));
    }
  }
  
  const updatedBytes = await pdfDoc.save();
  return new File([updatedBytes], baseFile.name, { type: 'application/pdf' });
}

export type SplitMode = 'every-page' | 'after-page' | 'page-range' | 'custom-selected';

export interface SplitConfig {
  mode: SplitMode;
  targetPage?: number;
  pageRanges?: string;
  customSelectedPages?: number[];
}

export async function splitPdf(baseFile: File, config: SplitConfig, onProgress?: (progress: number) => void): Promise<File[]> {
  const baseBytes = await baseFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(baseBytes);
  const totalPages = pdfDoc.getPageCount();
  const resultFiles: File[] = [];

  const createPdfFromIndices = async (indices: number[], filename: string) => {
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(pdfDoc, indices);
    copiedPages.forEach(page => newDoc.addPage(page));
    const bytes = await newDoc.save();
    return new File([bytes], filename, { type: 'application/pdf' });
  };

  const basename = baseFile.name.replace(/\.[^/.]+$/, "");

  if (config.mode === 'every-page') {
    for (let i = 0; i < totalPages; i++) {
      resultFiles.push(await createPdfFromIndices([i], `${basename}_page_${i + 1}.pdf`));
      if (onProgress) onProgress(((i + 1) / totalPages) * 100);
    }
  } else if (config.mode === 'after-page' && config.targetPage) {
    const splitIndex = config.targetPage - 1;
    if (splitIndex >= 0 && splitIndex < totalPages - 1) {
      const part1Indices = Array.from({ length: splitIndex + 1 }, (_, i) => i);
      const part2Indices = Array.from({ length: totalPages - (splitIndex + 1) }, (_, i) => i + splitIndex + 1);
      
      resultFiles.push(await createPdfFromIndices(part1Indices, `${basename}_part1.pdf`));
      if (onProgress) onProgress(50);
      resultFiles.push(await createPdfFromIndices(part2Indices, `${basename}_part2.pdf`));
      if (onProgress) onProgress(100);
    } else {
      throw new Error("Invalid split page target.");
    }
  } else if (config.mode === 'custom-selected' && config.customSelectedPages) {
    const indices = config.customSelectedPages.map(p => p - 1).filter(i => i >= 0 && i < totalPages);
    if (indices.length > 0) {
      indices.sort((a, b) => a - b);
      resultFiles.push(await createPdfFromIndices(indices, `${basename}_extracted.pdf`));
      if (onProgress) onProgress(100);
    }
  } else if (config.mode === 'page-range' && config.pageRanges) {
    const ranges = config.pageRanges.split(',').map(s => s.trim()).filter(s => s);
    let partNum = 1;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      let indices: number[] = [];
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let p = start; p <= end; p++) {
            if (p >= 1 && p <= totalPages) indices.push(p - 1);
          }
        }
      } else {
        const p = parseInt(range, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          indices.push(p - 1);
        }
      }
      
      if (indices.length > 0) {
        resultFiles.push(await createPdfFromIndices(indices, `${basename}_range_${partNum}.pdf`));
        partNum++;
      }
      if (onProgress) onProgress(((i + 1) / ranges.length) * 100);
    }
  }

  return resultFiles;
}

export type ExportScope = 'current-page' | 'all-pages' | 'selected-pages' | 'page-range' | 'custom-pages';

export interface ExportSectionConfig {
  scope: ExportScope;
  targetPage?: number;
  selectedPages?: number[];
  pageRange?: string;
  customPages?: string;
  includeAnnotations: boolean;
  flattenAnnotations: boolean;
  preserveMetadata: boolean;
  annotations?: any[]; // Array of Annotation from store
}

export async function exportPdfSection(
  baseFile: File, 
  config: ExportSectionConfig,
  onProgress?: (progress: number) => void
): Promise<File> {
  const baseBytes = await baseFile.arrayBuffer();
  const originalPdf = await PDFDocument.load(baseBytes);
  const totalPages = originalPdf.getPageCount();

  // Determine pages to extract
  let indicesToExtract: number[] = [];

  if (config.scope === 'current-page' && config.targetPage) {
    indicesToExtract = [config.targetPage - 1];
  } else if (config.scope === 'all-pages') {
    indicesToExtract = Array.from({ length: totalPages }, (_, i) => i);
  } else if (config.scope === 'selected-pages' && config.selectedPages) {
    indicesToExtract = config.selectedPages.map(p => p - 1);
  } else if (config.scope === 'page-range' && config.pageRange) {
    const [start, end] = config.pageRange.split('-').map(n => parseInt(n.trim(), 10));
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= totalPages) indicesToExtract.push(p - 1);
      }
    }
  } else if (config.scope === 'custom-pages' && config.customPages) {
    const parts = config.customPages.split(',').map(s => s.trim()).filter(s => s);
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let p = start; p <= end; p++) {
            if (p >= 1 && p <= totalPages) indicesToExtract.push(p - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) indicesToExtract.push(p - 1);
      }
    }
  }

  // Remove duplicates and sort
  indicesToExtract = [...new Set(indicesToExtract)].filter(i => i >= 0 && i < totalPages).sort((a, b) => a - b);

  if (indicesToExtract.length === 0) {
    throw new Error("No valid pages selected for export.");
  }

  const newPdf = await PDFDocument.create();
  
  // Preserve metadata
  if (config.preserveMetadata) {
    if (originalPdf.getTitle()) newPdf.setTitle(originalPdf.getTitle()!);
    if (originalPdf.getAuthor()) newPdf.setAuthor(originalPdf.getAuthor()!);
    if (originalPdf.getSubject()) newPdf.setSubject(originalPdf.getSubject()!);
    if (originalPdf.getCreator()) newPdf.setCreator(originalPdf.getCreator()!);
    if (originalPdf.getKeywords()) newPdf.setKeywords(originalPdf.getKeywords()!.split(' '));
  }

  const copiedPages = await newPdf.copyPages(originalPdf, indicesToExtract);
  
  copiedPages.forEach((page, index) => {
    newPdf.addPage(page);
    
    // Add annotations if requested
    if (config.includeAnnotations && config.annotations) {
      const originalPageNum = indicesToExtract[index] + 1;
      const pageAnnotations = config.annotations.filter(a => a.pageNumber === originalPageNum);
      
      const { height } = page.getSize();
      
      for (const ann of pageAnnotations) {
        const y = height - ann.y;
        
        if (ann.type === 'rectangle') {
          page.drawRectangle({
            x: ann.x,
            y: y - (ann.height || 0),
            width: ann.width || 0,
            height: ann.height || 0,
            borderColor: rgb(0.2, 0.5, 1),
            borderWidth: ann.strokeWidth,
          });
        } else if (ann.type === 'oval') {
          page.drawEllipse({
            x: ann.x + (ann.width || 0) / 2,
            y: y - (ann.height || 0) / 2,
            xScale: Math.abs((ann.width || 0) / 2),
            yScale: Math.abs((ann.height || 0) / 2),
            borderColor: rgb(0.2, 0.5, 1),
            borderWidth: ann.strokeWidth,
          });
        }
      }
    }
  });

  if (config.flattenAnnotations) {
    // Native PDF flattening
    const form = newPdf.getForm();
    form.flatten();
  }

  const bytes = await newPdf.save();
  const basename = baseFile.name.replace(/\.[^/.]+$/, "");
  return new File([bytes], `${basename}_export.pdf`, { type: 'application/pdf' });
}
