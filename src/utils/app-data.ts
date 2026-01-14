import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
export const baseDir = BaseDirectory.AppLocalData

export async function saveText(text: string, filename: string) {
  await writeTextFile(filename, text, {
    baseDir,
  })
}
export async function saveJSON<T>(data: T, filename: string) {
  const json = JSON.stringify(data, null, 2)
  await saveText(json, filename)
}

export async function loadText(filename: string) {
  const hasFile = await exists(filename, {
    baseDir,
  })

  if (!hasFile) {
    return null
  }

  const content = await readTextFile(filename, {
    baseDir,
  })
  return content
}

export async function loadJSON<T>(filename: string): Promise<T | null> {
  const content = await loadText(filename)
  if (!content) {
    return null
  }
  return JSON.parse(content) as T
}
