export function parseStringParam(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : undefined
  }
  return typeof value === 'string' ? value : undefined
}

export function parseNumberParam(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  const str = parseStringParam(value)
  if (!str) {
    return undefined
  }
  const parsed = Number.parseInt(str, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function parseBooleanParam(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }
  const str = parseStringParam(value)
  if (str === 'true') {
    return true
  }
  if (str === 'false') {
    return false
  }
  return undefined
}
