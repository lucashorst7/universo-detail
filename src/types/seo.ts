/**
 * Loose JSON-LD object shape. We keep it permissive so callers can pass
 * any valid structured-data payload without fighting a strict schema.
 */
export type JsonLdObject = {
  '@context'?: string
  '@type'?: string | string[]
  '@id'?: string
  [key: string]: unknown
}
