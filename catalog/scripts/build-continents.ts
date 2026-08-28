import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

const CONTINENTS: Array<[string, string]> = [
	[ 'Africa', 'AF' ],
	[ 'Antarctica', 'AN' ],
	[ 'Asia', 'AS' ],
	[ 'Europe', 'EU' ],
	[ 'North America', 'NA' ],
	[ 'Oceania', 'OC' ],
	[ 'South America', 'SA' ],
]

export async function buildContinents(): Promise<void> {
	const docs: CatalogDoc[] = CONTINENTS.map(([ name, code ]) => ({
		_id: catalogId('continents', code),
		name,
		code,
	}))
	await writeCatalog('continents', docs)
}
