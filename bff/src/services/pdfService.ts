import fs from 'fs'
const pdf = require('pdf-parse')
import { PDFDocument } from 'pdf-lib'
import { Document, Paragraph, TextRun, Packer } from 'docx'

export async function pdfToText(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  fs.writeFileSync(outputPath, data.text, 'utf-8')
}

export async function pdfToDocx(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  const paragraphs = data.text.split('\n').map((line: string) =>
    new Paragraph({
      children: [new TextRun(line || ' ')]
    })
  )

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}

export async function pdfToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  const markdown = data.text
    .split('\n\n')
    .map((para: string) => para.trim())
    .filter((para: string) => para.length > 0)
    .join('\n\n')

  fs.writeFileSync(outputPath, markdown, 'utf-8')
}

export async function extractPdfMetadata(inputPath: string): Promise<{
  pages: number
  text: string
  info: any
}> {
  const dataBuffer = fs.readFileSync(inputPath)
  const data = await pdf(dataBuffer)

  return {
    pages: data.numpages,
    text: data.text,
    info: data.info
  }
}

export async function mergePdfs(inputPaths: string[], outputPath: string): Promise<void> {
  const mergedPdf = await PDFDocument.create()

  for (const inputPath of inputPaths) {
    const pdfBytes = fs.readFileSync(inputPath)
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  const mergedPdfBytes = await mergedPdf.save()
  fs.writeFileSync(outputPath, mergedPdfBytes)
}
