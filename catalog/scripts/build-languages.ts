import i18n from '@cospired/i18n-iso-languages'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

const REGIONS: Array<[string, string]> = [
	[ 'ES', 'es' ],
	[ 'US', 'en' ],
]

export async function buildLanguages(): Promise<void> {
	const docs: CatalogDoc[] = []
	for (const [ region, locale ] of REGIONS) {
		const names = i18n.getNames(locale) as Record<string, string>
		for (const [ code, name ] of Object.entries(names)) {
			const catalogCode = `${code}_${region}`
			docs.push({
				_id: catalogId('languages', catalogCode),
				name,
				code: catalogCode,
			})
		}
	}
	await writeCatalog('languages', docs)
}
