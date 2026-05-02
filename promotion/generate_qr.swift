import AppKit
import CoreImage

let url = "https://old-nine86.github.io/mumu-weapons/"
let output = "promotion/site-qr.png"

guard
  let data = url.data(using: .utf8),
  let filter = CIFilter(name: "CIQRCodeGenerator")
else {
  fatalError("Unable to create QR filter")
}

filter.setValue(data, forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")

guard let qrImage = filter.outputImage else {
  fatalError("Unable to generate QR image")
}

let scale: CGFloat = 18
let quietModules: CGFloat = 4
let qrExtent = qrImage.extent.integral
let transformed = qrImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
let qrSize = Int(qrExtent.width * scale)
let quiet = Int(quietModules * scale)
let canvasSize = qrSize + quiet * 2

let colorSpace = CGColorSpaceCreateDeviceRGB()
guard
  let context = CGContext(
    data: nil,
    width: canvasSize,
    height: canvasSize,
    bitsPerComponent: 8,
    bytesPerRow: canvasSize * 4,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  )
else {
  fatalError("Unable to create bitmap context")
}

context.setFillColor(NSColor.white.cgColor)
context.fill(CGRect(x: 0, y: 0, width: canvasSize, height: canvasSize))

let ciContext = CIContext(options: [.useSoftwareRenderer: false])
guard let cgQR = ciContext.createCGImage(transformed, from: transformed.extent) else {
  fatalError("Unable to render QR image")
}

context.interpolationQuality = .none
context.draw(cgQR, in: CGRect(x: quiet, y: quiet, width: qrSize, height: qrSize))

guard let finalImage = context.makeImage() else {
  fatalError("Unable to create final image")
}

let nsImage = NSImage(cgImage: finalImage, size: NSSize(width: canvasSize, height: canvasSize))
guard
  let tiff = nsImage.tiffRepresentation,
  let bitmap = NSBitmapImageRep(data: tiff),
  let png = bitmap.representation(using: .png, properties: [:])
else {
  fatalError("Unable to encode PNG")
}

try png.write(to: URL(fileURLWithPath: output))
print("wrote \(output)")
