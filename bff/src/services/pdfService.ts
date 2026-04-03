import fs from 'fs'
const pdf = require('pdf-parse')
import { PDFDocument } from 'pdf-lib'
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx'

// ── helpers ──────────────────────────────────────────────────────────────────

function isPageNumber(line: string): boolean {
  return /^\s*\d{1,4}\s*$/.test(line) || /^\s*[-–]\s*\d+\s*[-–]\s*$/.test(line)
}

function isLikelyHeading(line: string): boolean {
  const t = line.trim()
  if (!t || t.length > 90) return false
  if (t.endsWith('.') || t.endsWith(',') || t.endsWith(';')) return false
  // ALL CAPS (min 4 chars, at least one letter)
  if (t === t.toUpperCase() && /[A-ZÀ-Ú]{2,}/.test(t)) return true
  // Short line (≤ 6 words) that looks like a title
  const words = t.split(/\s+/)
  if (words.length <= 6 && words.every(w => /^[A-ZÁÉÍÓÚÀÂÊÔ0-9(]/.test(w))) return true
  return false
}

function isBullet(line: string): boolean {
  return /^[•·▪▸►●◦‣⁃]\s+/.test(line.trim())
}

function isNumberedList(line: string): boolean {
  return /^\s*\d+[.)]\s+/.test(line)
}

// ── exports ───────────────────────────────────────────────────────────────────

export async function pdfToText(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  const text = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  fs.writeFileSync(outputPath, text, 'utf-8')
}

export async function pdfToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  const rawLines = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n\n')
    .split('\n')

  const out: string[] = []
  let prevEmpty = false

  for (const rawLine of rawLines) {
    const line = rawLine.replace(/[ \t]+/g, ' ').trimEnd()
    const trimmed = line.trim()

    // Skip bare page numbers
    if (isPageNumber(trimmed)) continue

    if (!trimmed) {
      if (!prevEmpty) out.push('')
      prevEmpty = true
      continue
    }

    prevEmpty = false

    if (isLikelyHeading(trimmed)) {
      out.push(`## ${trimmed}`)
      continue
    }

    if (isBullet(trimmed)) {
      out.push(`- ${trimmed.replace(/^[•·▪▸►●◦‣⁃]\s+/, '')}`)
      continue
    }

    if (isNumberedList(trimmed)) {
      out.push(trimmed)
      continue
    }

    out.push(trimmed)
  }

  const markdown = out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  fs.writeFileSync(outputPath, markdown, 'utf-8')
}

export async function pdfToDocx(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  const rawLines = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n\n')
    .split('\n')

  const children: Paragraph[] = []

  for (const rawLine of rawLines) {
    const line = rawLine.trim()

    if (isPageNumber(line)) continue

    if (!line) {
      children.push(new Paragraph({ children: [new TextRun('')] }))
      continue
    }

    if (isLikelyHeading(line)) {
      children.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_2 }))
      continue
    }

    if (isBullet(line)) {
      children.push(new Paragraph({
        children: [new TextRun(line.replace(/^[•·▪▸►●◦‣⁃]\s+/, ''))],
        bullet: { level: 0 }
      }))
      continue
    }

    children.push(new Paragraph({ children: [new TextRun(line)] }))
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}

export async function extractPdfMetadata(inputPath: string): Promise<{
  pages: number
  text: string
  info: any
}> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)
  return { pages: data.numpages, text: data.text, info: data.info }
}

export async function mergePdfs(inputPaths: string[], outputPath: string): Promise<void> {
  const mergedPdf = await PDFDocument.create()

  for (const inputPath of inputPaths) {
    const pdfBytes = fs.readFileSync(inputPath)
    const srcPdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices())
    copiedPages.forEach(page => mergedPdf.addPage(page))
  }

  const mergedPdfBytes = await mergedPdf.save()
  fs.writeFileSync(outputPath, mergedPdfBytes)
}
