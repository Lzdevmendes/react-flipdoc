import fs from 'fs'
const htmlPdf = require('html-pdf-node')
import { Document, Paragraph, TextRun, Packer } from 'docx'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' }
}

export async function textToPdf(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Courier New', monospace;
      font-size: 10.5pt;
      line-height: 1.65;
      padding: 40px 50px;
      color: #1a1a1a;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>${escapeHtml(text)}</body>
</html>`

  const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, PDF_OPTIONS)
  fs.writeFileSync(outputPath, pdfBuffer)
}

export async function textToDocx(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')

  const children = text.split('\n').map(line =>
    new Paragraph({ children: [new TextRun(line || '')] })
  )

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}

export async function textToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')
  fs.writeFileSync(outputPath, text, 'utf-8')
}
