import fs from 'fs'
import mammoth from 'mammoth'
const htmlPdf = require('html-pdf-node')
import { marked } from 'marked'
import TurndownService from 'turndown'

export async function docxToHtml(inputPath: string): Promise<string> {
  const result = await mammoth.convertToHtml({ path: inputPath })
  return result.value
}

export async function docxToText(inputPath: string, outputPath: string): Promise<void> {
  const result = await mammoth.extractRawText({ path: inputPath })
  fs.writeFileSync(outputPath, result.value, 'utf-8')
}

export async function docxToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const html = await docxToHtml(inputPath)
  const turndownService = new TurndownService()
  const markdown = turndownService.turndown(html)
  fs.writeFileSync(outputPath, markdown, 'utf-8')
}

export async function docxToPdf(inputPath: string, outputPath: string): Promise<void> {
  const html = await docxToHtml(inputPath)

  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        p { margin: 10px 0; }
        h1, h2, h3, h4, h5, h6 { margin: 20px 0 10px 0; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      ${html}
    </body>
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
