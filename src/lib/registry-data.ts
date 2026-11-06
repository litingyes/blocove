import type { RegistryCatalog } from './registry-catalog'
import catalogJson from '@/generated/registry.json'

/**
 * The registry contract the docs render. `scripts/build-catalog.mjs` derives it
 * from `public/r/registry.json`, and the default route entry imports it once so
 * the routes, the docs shell and the catalog pages all read one object.
 */
export const registryCatalog = catalogJson as unknown as RegistryCatalog

export const registryItemsByName = new Map(
  registryCatalog.items.map(item => [item.name, item]),
)
