import fs from 'fs'
import { marked } from 'marked'
const htmlPdf = require('html-pdf-node')
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx'

// ── HTML template ─────────────────────────────────────────────────────────────

const PDF_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    padding: 40px 50px;
    max-width: 820px;
    margin: 0 auto;
    color: #1a1a1a;
  }
  h1 { font-size: 22pt; margin: 28px 0 10px; }
  h2 { font-size: 17pt; margin: 22px 0 8px; }
  h3 { font-size: 14pt; margin: 18px 0 6px; }
  h4, h5, h6 { font-size: 12pt; margin: 14px 0 4px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  code {
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
  }
  pre {
    background: #f3f4f6;
    padding: 14px 18px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 10pt;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    border-left: 4px solid #d1d5db;
    margin: 12px 0;
    padding: 4px 16px;
    color: #6b7280;
  }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  a { color: #2563eb; text-decoration: none; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
`

function buildHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${PDF_STYLES}</style>
</head>
<body>${body}</body>
</html>`
}

const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' }
}

// ── inline markdown parser for DOCX ──────────────────────────────────────────

function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = []
  // Matches: **bold**, *italic*, `code`, plain text
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+)/gs

  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      runs.push(new TextRun({ text: match[1], bold: true }))
    } else if (match[2]) {
      runs.push(new TextRun({ text: match[2], italics: true }))
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], font: 'Courier New' }))
    } else if (match[4]) {
      runs.push(new TextRun(match[4]))
    }
  }

  return runs.length ? runs : [new TextRun(text)]
}

// ── exports ───────────────────────────────────────────────────────────────────

export async function markdownToHtml(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const html = await marked(markdown)
  fs.writeFileSync(outputPath, buildHtml(html), 'utf-8')
}

export async function markdownToPdf(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const html = await marked(markdown)
  const pdfBuffer = await htmlPdf.generatePdf({ content: buildHtml(html) }, PDF_OPTIONS)
  fs.writeFileSync(outputPath, pdfBuffer)
}

export async function markdownToDocx(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const lines = markdown.split('\n')
  const children: Paragraph[] = []

  const headingLevels: Record<string, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
    '# ': HeadingLevel.HEADING_1,
    '## ': HeadingLevel.HEADING_2,
    '### ': HeadingLevel.HEADING_3,
    '#### ': HeadingLevel.HEADING_4,
    '##### ': HeadingLevel.HEADING_5,
    '###### ': HeadingLevel.HEADING_6,
  }

  for (const line of lines) {
    // Headings
    let isHeading = false
    for (const [prefix, level] of Object.entries(headingLevels)) {
      if (line.startsWith(prefix)) {
        children.push(new Paragraph({ text: line.slice(prefix.length), heading: level }))
        isHeading = true
        break
      }
    }
    if (isHeading) continue

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      children.push(new Paragraph({ children: [new TextRun({ text: '─'.repeat(60), color: 'AAAAAA' })] }))
      continue
    }

    // Unordered list
    const bulletMatch = line.match(/^(\s*)[*\-+]\s+(.*)/)
    if (bulletMatch) {
      const depth = Math.floor(bulletMatch[1].length / 2)
      children.push(new Paragraph({
        children: parseInlineRuns(bulletMatch[2]),
        bullet: { level: Math.min(depth, 8) }
      }))
      continue
    }

    // Ordered list
    const numMatch = line.match(/^(\s*)\d+[.)]\s+(.*)/)
    if (numMatch) {
      const depth = Math.floor(numMatch[1].length / 2)
      children.push(new Paragraph({
        children: parseInlineRuns(numMatch[2]),
        numbering: { reference: 'default-numbering', level: Math.min(depth, 8) }
      }))
      continue
    }

    // Blockquote (strip >, add italic)
    if (line.startsWith('> ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), italics: true, color: '6B7280' })]
      }))
      continue
    }

    // Empty line
    if (!line.trim()) {
      children.push(new Paragraph({ children: [new TextRun('')] }))
      continue
    }

    // Regular paragraph with inline formatting
    children.push(new Paragraph({ children: parseInlineRuns(line) }))
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: Array.from({ length: 9 }, (_, i) => ({
          level: i,
          format: 'decimal' as const,
          text: `%${i + 1}.`,
          alignment: 'left' as const,
        }))
      }]
    },
    sections: [{ properties: {}, children }]
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outputPath, buffer)
}

export async function markdownToText(inputPath: string, outputPath: string): Promise<void> {
  const markdown = fs.readFileSync(inputPath, 'utf-8')
  const text = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*_]{3,}$/gm, '─'.repeat(40))
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  fs.writeFileSync(outputPath, text, 'utf-8')
}
