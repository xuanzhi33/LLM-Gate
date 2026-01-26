import * as OpenCC from 'opencc-js'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const converter = OpenCC.Converter({ from: 'cn', to: 'twp' })

async function convertToTraditional() {
  const zhPath = join(process.cwd(), 'src/i18n/zh.json')
  const zhHantPath = join(process.cwd(), 'src/i18n/zh-hant.json')

  const zhContent = await readFile(zhPath, 'utf-8')
  const zhJson = JSON.parse(zhContent)

  const convertValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return converter(value)
    }
    if (Array.isArray(value)) {
      return value.map(convertValue)
    }
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, convertValue(v)]))
    }
    return value
  }

  const zhHantJson = convertValue(zhJson)

  await writeFile(zhHantPath, JSON.stringify(zhHantJson, null, 2) + '\n', 'utf-8')
  console.log('✓ Converted zh.json to zh-hant.json')
}

convertToTraditional()
