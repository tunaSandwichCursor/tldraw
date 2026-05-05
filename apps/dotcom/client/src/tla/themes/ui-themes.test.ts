import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

describe('UI_THEMES', () => {
	it('includes a Sunset theme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')
		expect(sunset).toBeDefined()
		expect(sunset!.name).toBe('Sunset')
		expect(sunset!.lightBackground).toBeTruthy()
		expect(sunset!.darkBackground).toBeTruthy()
	})

	// Use Solarized as the canonical key set every UI theme must provide. If any
	// theme is missing a key, the dotcom shell or canvas would render with a
	// stale/leaked CSS variable from the previous theme.
	const canonical = UI_THEMES.find((t) => t.id === 'solarized')!
	const tlKeys = Object.keys(canonical.light.tl).sort()
	const tlaKeys = Object.keys(canonical.light.tla).sort()

	it.each(UI_THEMES.map((t) => [t.id, t]))(
		'theme %s defines the full set of tl + tla CSS variables in both light and dark variants',
		(_, theme) => {
			for (const variant of ['light', 'dark'] as const) {
				expect(Object.keys(theme[variant].tl).sort()).toEqual(tlKeys)
				expect(Object.keys(theme[variant].tla).sort()).toEqual(tlaKeys)
			}
		}
	)

	it('Sunset has a derived TLTheme with id "sunset"', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')!
		expect(sunset.theme.id).toBe('sunset')
		expect(sunset.theme.colors.light.background).toBe('#fff4e6')
		expect(sunset.theme.colors.dark.background).toBe('#2d1b3d')
	})
})
