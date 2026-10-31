import Foundation
import PDFKit
import AppKit

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}

let arguments = Array(CommandLine.arguments.dropFirst())
guard arguments.count == 1 || arguments.count == 2 else {
    fail("Usage: swift inspect-pdf.swift DOCUMENT.pdf [CHECKS.json]")
}
guard let document = PDFDocument(url: URL(fileURLWithPath: arguments[0])), document.pageCount > 0 else {
    fail("Cannot open a nonempty PDF")
}
let pages = (0..<document.pageCount).map { document.page(at: $0)?.string ?? "" }
let text = pages.joined(separator: "\n")
var checks: [String: Any] = [:]
if arguments.count == 2 {
    let data = try Data(contentsOf: URL(fileURLWithPath: arguments[1]))
    guard let parsed = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        fail("Checks must be a JSON object")
    }
    checks = parsed
}
let allowedKeys = Set(["pages", "contains", "starts", "page_contains", "render"])
guard Set(checks.keys).isSubset(of: allowedKeys) else { fail("Unknown check key") }
func pageIndex(_ number: String) -> Int {
    guard let index = Int(number), index > 0, index <= pages.count else { fail("Invalid page number") }
    return index - 1
}
if let expected = checks["pages"] as? Int, expected != pages.count { fail("Unexpected page count: \(pages.count)") }
for expected in checks["contains"] as? [String] ?? [] {
    guard text.contains(expected) else { fail("Required text missing") }
}
for (number, heading) in checks["starts"] as? [String: String] ?? [:] {
    guard pages[pageIndex(number)].trimmingCharacters(in: .whitespacesAndNewlines).hasPrefix(heading) else {
        fail("Unexpected start of page \(number)")
    }
}
for (number, expectedTexts) in checks["page_contains"] as? [String: [String]] ?? [:] {
    for expected in expectedTexts {
        guard pages[pageIndex(number)].contains(expected) else { fail("Required text missing from page \(number)") }
    }
}
for (number, output) in checks["render"] as? [String: String] ?? [:] {
    let image = document.page(at: pageIndex(number))!.thumbnail(of: NSSize(width: 1000, height: 1400), for: .mediaBox)
    guard let tiff = image.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff),
          let png = bitmap.representation(using: .png, properties: [:]) else { fail("Cannot render page \(number)") }
    try png.write(to: URL(fileURLWithPath: output))
}
print("PASS: \(URL(fileURLWithPath: arguments[0]).lastPathComponent): \(pages.count) pages")
for (index, page) in pages.enumerated() {
    let firstLine = page.split(separator: "\n").first.map(String.init) ?? "[no extractable text]"
    print("Page \(index + 1): \(firstLine.prefix(80))")
}