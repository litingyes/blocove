export function apiId(name: string) {
  return `api-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}
