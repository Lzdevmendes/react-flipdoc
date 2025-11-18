import path from 'path'
import { pdfToText, pdfToDocx, pdfToMarkdown } from './pdfService'
import { docxToPdf, docxToText, docxToMarkdown } from './docxService'
import { imageToPdf } from './imageService'
import { textToPdf, textToDocx, textToMarkdown } from './textService'
import { markdownToPdf, markdownToDocx, markdownToHtml, markdownToText } from './markdownService'

interface ConversionOptions {
  inputPath: string
  outputPath: string
  sourceFormat: string
  targetFormat: string
}

export async function convertFile(options: ConversionOptions): Promise<void> {
  const { inputPath, outputPath, sourceFormat, targetFormat } = options

  const source = sourceFormat.toLowerCase().replace('.', '')
  const target = targetFormat.toLowerCase().replace('.', '')

  if (source === target) {
    throw new Error('Source and target formats are the same')
  }

  if (source === 'pdf') {
    if (target === 'txt') return pdfToText(inputPath, outputPath)
    if (target === 'docx') return pdfToDocx(inputPath, outputPath)
    if (target === 'doc') return pdfToDocx(inputPath, outputPath)
    if (target === 'md') return pdfToMarkdown(inputPath, outputPath)
  }

  if (['docx', 'doc'].includes(source)) {
    if (target === 'pdf') return docxToPdf(inputPath, outputPath)
    if (target === 'txt') return docxToText(inputPath, outputPath)
    if (target === 'md') return docxToMarkdown(inputPath, outputPath)
  }

  if (source === 'txt') {
    if (target === 'pdf') return textToPdf(inputPath, outputPath)
    if (target === 'docx') return textToDocx(inputPath, outputPath)
    if (target === 'doc') return textToDocx(inputPath, outputPath)
    if (target === 'md') return textToMarkdown(inputPath, outputPath)
  }

  if (['md', 'markdown'].includes(source)) {
    if (target === 'pdf') return markdownToPdf(inputPath, outputPath)
    if (target === 'docx') return markdownToDocx(inputPath, outputPath)
    if (target === 'doc') return markdownToDocx(inputPath, outputPath)
    if (target === 'html') return markdownToHtml(inputPath, outputPath)
    if (target === 'txt') return markdownToText(inputPath, outputPath)
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(source)) {
    if (target === 'pdf') return imageToPdf(inputPath, outputPath)
  }

  throw new Error(`Conversion from ${source} to ${target} is not supported yet`)
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase().replace('.', '')
}

export function isSupportedConversion(sourceFormat: string, targetFormat: string): boolean {
  const source = sourceFormat.toLowerCase().replace('.', '')
  const target = targetFormat.toLowerCase().replace('.', '')

  const supportedConversions: Record<string, string[]> = {
    'pdf': ['txt', 'docx', 'doc', 'md'],
    'docx': ['pdf', 'txt', 'md'],
    'doc': ['pdf', 'txt', 'md'],
    'txt': ['pdf', 'docx', 'doc', 'md'],
    'md': ['pdf', 'docx', 'doc', 'html', 'txt'],
    'markdown': ['pdf', 'docx', 'doc', 'html', 'txt'],
    'jpg': ['pdf'],
    'jpeg': ['pdf'],
    'png': ['pdf'],
    'webp': ['pdf'],
    'gif': ['pdf'],
    'bmp': ['pdf']
  }

  return supportedConversions[source]?.includes(target) || false
}
