import base64 from 'base-64'

export function decodeCursor(cursor: string): any {
  return JSON.parse(base64.decode(cursor))
}
