# HEIC Image Intake

- Keep the source image unchanged. Inspect it before transcribing content or choosing a workbook layout.
- On macOS, convert HEIC to PNG with `sips -s format png SOURCE.heic --out /tmp/source.png`.
- If a viewer rejects a large image, make a smaller JPEG preview with `sips -s format jpeg -s formatOptions 85 -Z 2400 /tmp/source.png --out /tmp/source-preview.jpg`.
- Read the whole image, including section breaks and any adjacent columns. If text is unclear, record the uncertainty rather than guessing.
- Check the transcription and per-section item counts against the preview before creating an output document.