import world from 'world-countries'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

function dialFor(country: (typeof world)[number]): string {
	const root = country.idd?.root ?? ''
	const suffixes = country.idd?.suffixes ?? []
	return root + (suffixes.length === 1 ? suffixes[0] : '')
}

const OVERRIDES: Record<string, string> = {
	'+1': 'United States',
}

export async function buildPhoneCodes(): Promise<void> {
	const groups = new Map<string, Array<{ name: string; area: number }>>()
	for (const country of world) {
		const dial = dialFor(country)
		if (!dial) continue
		const group = groups.get(dial) ?? []
		group.push({ name: country.name.common, area: country.area ?? 0 })
		groups.set(dial, group)
	}
	const docs: CatalogDoc[] = [ ...groups.entries() ].map(([ dial, group ]) => {
		let representative = group[0]
		for (const candidate of group) {
			if (candidate.area > representative.area) representative = candidate
		}
		const name = OVERRIDES[dial] ?? representative.name
		return {
			_id: catalogId('phoneCodes', dial),
			name,
			code: dial,
		}
	})
	await writeCatalog('phoneCodes', docs)
}
