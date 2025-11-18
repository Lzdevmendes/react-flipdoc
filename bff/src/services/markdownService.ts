import fs from 'fs'
import { marked } from 'marked'
const htmlPdf = require('html-pdf-node')
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx'

export async function markdownToHtml(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const html = await marked(markdown)

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 20px;
          color: #666;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background: #f4f4f4;
          font-weight: bold;
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `

  fs.writeFileSync(outputPath, fullHtml, 'utf-8')
}

export async function markdownToPdf(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const html = await marked(markdown)

  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1, h2, h3, h4, h5, h6 { margin: 20px 0 10px 0; }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 20px;
          color: #666;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background: #f4f4f4;
          font-weight: bold;
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `

  const file = { content: styledHtml }
  const options = {
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
  }

  const pdfBuffer = await htmlPdf.generatePdf(file, options)
  fs.writeFileSync(outputPath, pdfBuffer)
}

export async function markdownToDocx(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const lines = markdown.split('\n')

  const children: Paragraph[] = []

  for (const line of lines) {
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1
      }))
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2
      }))
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.substring(4),
        heading: HeadingLevel.HEADING_3
      }))
    } else {
      children.push(new Paragraph({
        children: [new TextRun(line || ' ')]
      }))
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}

export async function markdownToText(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const text = markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')

  fs.writeFileSync(outputPath, text, 'utf-8')
}
