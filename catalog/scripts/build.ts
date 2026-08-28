import { buildContinents } from './build-continents.js'
import { buildCountries } from './build-countries.js'
import { buildStates } from './build-states.js'
import { buildCities } from './build-cities.js'
import { buildCurrencies } from './build-currencies.js'
import { buildLanguages } from './build-languages.js'
import { buildTimezones } from './build-timezones.js'
import { buildPhoneCodes } from './build-phonecodes.js'

const BUILDERS = {
	continents: buildContinents,
	countries: buildCountries,
	states: buildStates,
	cities: buildCities,
	currencies: buildCurrencies,
	languages: buildLanguages,
	timezones: buildTimezones,
	phoneCodes: buildPhoneCodes,
} as const

function usage(): never {
	console.error('Usage: tsx scripts/build.ts --all | --type=<name>')
	console.error(`Available types: ${Object.keys(BUILDERS).join(', ')}`)
	process.exit(1)
}

function parseArgs(): { name: string | 'all' } {
	const args = process.argv.slice(2)
	const type = args.find((a) => a.startsWith('--type='))
	if (args.includes('--all')) return { name: 'all' }
	if (type) return { name: type.split('=')[1] }
	return usage()
}

async function main(): Promise<void> {
	const { name } = parseArgs()
	if (name === 'all') {
		for (const [ type, build ] of Object.entries(BUILDERS)) {
			console.log(`▶ ${type}`)
			await build()
		}
		return
	}
	const build = BUILDERS[name as keyof typeof BUILDERS]
	if (!build) usage()
	console.log(`▶ ${name}`)
	await build()
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
