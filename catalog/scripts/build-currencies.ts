import cc from 'currency-codes'
import { catalogId, writeCatalog, type CatalogDoc } from './shared.js'

export async function buildCurrencies(): Promise<void> {
	const data = (cc as unknown as { data: Array<{ code: string; currency: string }> }).data
	const docs: CatalogDoc[] = data.map((c) => ({
		_id: catalogId('currencies', c.code),
		name: c.currency,
		code: c.code,
	}))
	await writeCatalog('currencies', docs)
}
