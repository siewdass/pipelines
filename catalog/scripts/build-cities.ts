import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

export async function buildCities(): Promise<void> {
	const countries = await getCountries()
	const docs: CatalogDoc[] = []
	let total = 0
	for (const country of countries) {
		const states = await getStatesOfCountry(country.iso2)
		for (const state of states) {
			const stateCode = `${country.iso2}-${state.iso2 || `s${state.id}`}`
			const cities = await getCitiesOfState(country.iso2, state.iso2)
			for (const city of cities) {
				const code = `${stateCode}-${city.id}`
				docs.push({
					_id: catalogId('cities', code),
					name: city.name,
					code,
					parentCode: stateCode,
				})
			}
			total += cities.length
		}
		console.log(`  ${country.iso2} ${country.name} — ${total} cities so far`)
	}
	await writeCatalog('cities', docs)
}
