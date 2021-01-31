import base64 from 'base-64'

export function encodeCursor(cursor: any): string {
  return base64.encode(JSON.stringify(cursor))
}
