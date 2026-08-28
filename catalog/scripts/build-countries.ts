import world from 'world-countries'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

function continentFor(region: string, subregion: string): string {
	switch (region) {
	case 'Africa':
		return 'AF'
	case 'Antarctica':
	case 'Antarctic':
		return 'AN'
	case 'Asia':
		return 'AS'
	case 'Europe':
		return 'EU'
	case 'Oceania':
		return 'OC'
	case 'Americas':
		return subregion === 'South America' ? 'SA' : 'NA'
	default:
		return ''
	}
}

export async function buildCountries(): Promise<void> {
	const docs: CatalogDoc[] = world.map((c) => {
		const parentCode = continentFor(c.region, c.subregion)
		return {
			_id: catalogId('countries', c.cca2),
			name: c.name.common,
			code: c.cca2,
			...(parentCode ? { parentCode } : {}),
		}
	})
	await writeCatalog('countries', docs)
}
