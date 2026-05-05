import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

describe('UI_THEMES', () => {
	const baseline = UI_THEMES[0]
	const tlKeys = Object.keys(baseline.light.tl).sort()
	const tlaKeys = Object.keys(baseline.light.tla).sort()

	it('includes the sunset theme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')
		expect(sunset).toBeDefined()
		expect(sunset?.name).toBe('Sunset')
		expect(sunset?.lightBackground).toBeTruthy()
		expect(sunset?.darkBackground).toBeTruthy()
	})

	it.each(UI_THEMES.map((t) => [t.id, t]))(
		'theme %s defines the full set of light/dark CSS variables',
		(_id, theme) => {
			expect(Object.keys(theme.light.tl).sort()).toEqual(tlKeys)
			expect(Object.keys(theme.light.tla).sort()).toEqual(tlaKeys)
			expect(Object.keys(theme.dark.tl).sort()).toEqual(tlKeys)
			expect(Object.keys(theme.dark.tla).sort()).toEqual(tlaKeys)
		}
	)

	it.each(UI_THEMES.map((t) => [t.id, t]))(
		'theme %s exposes a derived TLTheme with matching id',
		(id, theme) => {
			expect(theme.theme.id).toBe(id)
			expect(theme.theme.colors.light.background).toBe(theme.light.tl['tl-color-background'])
			expect(theme.theme.colors.dark.background).toBe(theme.dark.tl['tl-color-background'])
		}
	)
})
