import fs from 'fs'
const htmlPdf = require('html-pdf-node')
import { Document, Paragraph, TextRun, Packer } from 'docx'

export async function textToPdf(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          padding: 40px;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>${text}</body>
    </html>
  `

  const file = { content: htmlContent }
  const options = {
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
  }

  const pdfBuffer = await htmlPdf.generatePdf(file, options)
  fs.writeFileSync(outputPath, pdfBuffer)
}

export async function textToDocx(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')

  const paragraphs = text.split('\n').map(line =>
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

export async function textToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8')
  fs.writeFileSync(outputPath, text, 'utf-8')
}
