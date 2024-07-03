export default function trimForm<T extends Record<string, unknown>>(form: T): T {
  return Object.keys(form).reduce((acc, curr) => {
    // @ts-expect-error ignore TS2862: Type 'T' is generic and can only be indexed for reading
    acc[curr] = trimItem(form[curr])
    return acc
  }, {} as T)
}

function trimItem(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value)) {
    return value.map(item => trimItem(item))
  }
  if (typeof value === 'object') {
    return trimForm(value as Record<string, unknown>)
  }
  return value
}
