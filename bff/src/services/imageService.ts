import fs from 'fs'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

export async function imageToPdf(inputPath: string, outputPath: string): Promise<void> {
  const imageBuffer = fs.readFileSync(inputPath)
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  const pngBuffer = await image.png().toBuffer()

  const pdfDoc = await PDFDocument.create()

  let pdfImage
  if (metadata.format === 'png') {
    pdfImage = await pdfDoc.embedPng(pngBuffer)
  } else {
    const jpgBuffer = await image.jpeg().toBuffer()
    pdfImage = await pdfDoc.embedJpg(jpgBuffer)
  }

  const page = pdfDoc.addPage([pdfImage.width, pdfImage.height])
  page.drawImage(pdfImage, {
    x: 0,
    y: 0,
    width: pdfImage.width,
    height: pdfImage.height
  })

  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)
}

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  await sharp(inputPath)
    .resize(width, height, { fit: 'inside' })
    .toFile(outputPath)
}

export async function convertImageFormat(
  inputPath: string,
  outputPath: string,
  format: 'png' | 'jpg' | 'webp'
): Promise<void> {
  const image = sharp(inputPath)

  switch (format) {
    case 'png':
      await image.png().toFile(outputPath)
      break
    case 'jpg':
      await image.jpeg({ quality: 90 }).toFile(outputPath)
      break
    case 'webp':
      await image.webp({ quality: 90 }).toFile(outputPath)
      break
  }
}
