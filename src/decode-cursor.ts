import { decompress } from 'lzbase62'

import { Cursor } from './constants'

export function decodeCursor(cursor: string): Cursor {
  return JSON.parse(decompress(cursor))
}
