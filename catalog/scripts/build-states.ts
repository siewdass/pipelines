import { getCountries, getStatesOfCountry } from '@countrystatecity/countries'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

export async function buildStates(): Promise<void> {
	const countries = await getCountries()
	const docs: CatalogDoc[] = []
	for (const country of countries) {
		const states = await getStatesOfCountry(country.iso2)
		for (const state of states) {
			const suffix = state.iso2 || `s${state.id}`
			const code = `${country.iso2}-${suffix}`
			docs.push({
				_id: catalogId('states', code),
				name: state.name,
				code,
				parentCode: country.iso2,
			})
		}
	}
	await writeCatalog('states', docs)
}
