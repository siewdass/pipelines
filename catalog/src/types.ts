export const CATALOG_TYPES = [
	'continents',
	'countries',
	'states',
	'cities',
	'currencies',
	'languages',
	'timezones',
	'phoneCodes'
] as const

export type CatalogType = (typeof CATALOG_TYPES)[number]

export type CatalogDoc = {
	_id: string
	name: string
	code: string
	parentCode?: string
}
