import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

describe('UI_THEMES', () => {
	it('includes a complete Sunset theme', () => {
		const baseline = UI_THEMES[0]
		const sunset = UI_THEMES.find((theme) => theme.id === 'sunset')

		expect(baseline).toBeDefined()
		expect(sunset).toBeDefined()
		expect(sunset).toMatchObject({
			id: 'sunset',
			name: 'Sunset',
			lightBackground: '#fff0e6',
			darkBackground: '#241127',
		})
		expect(Object.keys(sunset!.light.tl).sort()).toEqual(Object.keys(baseline!.light.tl).sort())
		expect(Object.keys(sunset!.light.tla).sort()).toEqual(Object.keys(baseline!.light.tla).sort())
		expect(Object.keys(sunset!.dark.tl).sort()).toEqual(Object.keys(baseline!.dark.tl).sort())
		expect(Object.keys(sunset!.dark.tla).sort()).toEqual(Object.keys(baseline!.dark.tla).sort())
	})
})
