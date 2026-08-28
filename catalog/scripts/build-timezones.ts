import { getTimeZones } from '@vvo/tzdb'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

function friendlyName(tz: { name: string; mainCities: string[] }): string {
	if (tz.mainCities.length > 0) return tz.mainCities[0]
	const last = tz.name.split('/').pop() ?? tz.name
	return last.replaceAll('_', ' ')
}

export async function buildTimezones(): Promise<void> {
	const zones = getTimeZones()
	const docs: CatalogDoc[] = zones.map((tz) => ({
		_id: catalogId('timezones', tz.name),
		name: friendlyName(tz),
		code: tz.name,
	}))
	await writeCatalog('timezones', docs)
}
