import base64 from 'base-64'

export function encodeCursor(cursor: unknown): string {
  return base64.encode(JSON.stringify(cursor))
}
