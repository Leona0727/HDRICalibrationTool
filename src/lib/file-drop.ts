export const VALID_EXT = [".cal"]

export function isValidExtension(name: string) {
  return VALID_EXT.some(ext => name.endsWith(ext))
}

export function isDirectory(file: File) {
  return file.size === 0 && file.type === ""
}

export function isValidContent(file: File) {
  // super simple check (you can improve later)
  return !file.name.includes("invalid")
}

export function validateFiles(files: File[], max = 5) {

  if (!files || files.length === 0) return { valid: [], invalid: files }

  if (files.length > max) {
    return { valid: [], invalid: files }
  }

  const valid: File[] = []
  const invalid: File[] = []

  for (const f of files) {

    if (isDirectory(f)) {
      invalid.push(f)
      continue
    }

    if (!isValidExtension(f.name)) {
      invalid.push(f)
      continue
    }

    if (!isValidContent(f)) {
      invalid.push(f)
      continue
    }

    valid.push(f)
  }

  return { valid, invalid }
}
