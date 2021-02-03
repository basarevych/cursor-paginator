import { compress } from 'lzbase62'

import { Cursor } from './constants'

export function encodeCursor(cursor: Cursor): string {
  return compress(JSON.stringify(cursor))
}
