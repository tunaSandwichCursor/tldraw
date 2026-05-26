import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

describe('UI_THEMES', () => {
	it('includes the sunset theme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')
		expect(sunset).toBeDefined()
		expect(sunset!.name).toBe('Sunset')
	})

	it('sunset theme has complete light and dark variants', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')!
		expect(sunset.lightBackground).toBeTruthy()
		expect(sunset.darkBackground).toBeTruthy()
		expect(Object.keys(sunset.light.tl).length).toBeGreaterThan(0)
		expect(Object.keys(sunset.light.tla).length).toBeGreaterThan(0)
		expect(Object.keys(sunset.dark.tl).length).toBeGreaterThan(0)
		expect(Object.keys(sunset.dark.tla).length).toBeGreaterThan(0)
	})

	it('all themes have the same set of tl CSS variables', () => {
		const referenceKeys = Object.keys(UI_THEMES[0].light.tl).sort()
		for (const theme of UI_THEMES) {
			expect(Object.keys(theme.light.tl).sort()).toEqual(referenceKeys)
			expect(Object.keys(theme.dark.tl).sort()).toEqual(referenceKeys)
		}
	})

	it('all themes have the same set of tla CSS variables', () => {
		const referenceKeys = Object.keys(UI_THEMES[0].light.tla).sort()
		for (const theme of UI_THEMES) {
			expect(Object.keys(theme.light.tla).sort()).toEqual(referenceKeys)
			expect(Object.keys(theme.dark.tla).sort()).toEqual(referenceKeys)
		}
	})

	it('sunset theme builds a valid TLTheme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')!
		expect(sunset.theme).toBeDefined()
		expect(sunset.theme.id).toBe('sunset')
		expect(sunset.theme.colors.light.background).toBe('#fef6ee')
		expect(sunset.theme.colors.dark.background).toBe('#1e1525')
	})
})
