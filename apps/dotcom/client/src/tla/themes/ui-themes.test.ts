import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

describe('UI_THEMES', () => {
	const sunset = UI_THEMES.find((t) => t.id === 'sunset')

	it('includes the sunset theme', () => {
		expect(sunset).toBeDefined()
		expect(sunset!.name).toBe('Sunset')
	})

	it('has lightBackground and darkBackground set', () => {
		expect(sunset!.lightBackground).toMatch(/^#[0-9a-fA-F]{6}$/)
		expect(sunset!.darkBackground).toMatch(/^#[0-9a-fA-F]{6}$/)
	})

	it('has complete light.tl CSS variables', () => {
		const keys = Object.keys(sunset!.light.tl)
		expect(keys).toContain('tl-color-background')
		expect(keys).toContain('tl-color-text')
		expect(keys).toContain('tl-color-panel')
		expect(keys).toContain('tl-color-selected')
		expect(keys).toContain('tl-color-primary')
		expect(keys).toContain('tl-color-selection-stroke')
		expect(keys).toContain('tl-color-selection-fill')
	})

	it('has complete light.tla CSS variables', () => {
		const keys = Object.keys(sunset!.light.tla)
		expect(keys).toContain('tla-color-sidebar')
		expect(keys).toContain('tla-color-canvas')
		expect(keys).toContain('tla-color-panel')
		expect(keys).toContain('tla-color-cta')
		expect(keys).toContain('tla-color-primary')
	})

	it('has complete dark.tl CSS variables', () => {
		const keys = Object.keys(sunset!.dark.tl)
		expect(keys).toContain('tl-color-background')
		expect(keys).toContain('tl-color-text')
		expect(keys).toContain('tl-color-panel')
		expect(keys).toContain('tl-color-selected')
		expect(keys).toContain('tl-color-primary')
		expect(keys).toContain('tl-color-selection-stroke')
		expect(keys).toContain('tl-color-selection-fill')
	})

	it('has complete dark.tla CSS variables', () => {
		const keys = Object.keys(sunset!.dark.tla)
		expect(keys).toContain('tla-color-sidebar')
		expect(keys).toContain('tla-color-canvas')
		expect(keys).toContain('tla-color-panel')
		expect(keys).toContain('tla-color-cta')
		expect(keys).toContain('tla-color-primary')
	})

	it('has the same variable keys as other themes', () => {
		const solarized = UI_THEMES.find((t) => t.id === 'solarized')!
		expect(Object.keys(sunset!.light.tl).sort()).toEqual(Object.keys(solarized.light.tl).sort())
		expect(Object.keys(sunset!.light.tla).sort()).toEqual(Object.keys(solarized.light.tla).sort())
		expect(Object.keys(sunset!.dark.tl).sort()).toEqual(Object.keys(solarized.dark.tl).sort())
		expect(Object.keys(sunset!.dark.tla).sort()).toEqual(Object.keys(solarized.dark.tla).sort())
	})

	it('builds a valid TLTheme', () => {
		expect(sunset!.theme).toBeDefined()
		expect(sunset!.theme.id).toBe('sunset')
		expect(sunset!.theme.colors.light.background).toBe('#fff5ee')
		expect(sunset!.theme.colors.dark.background).toBe('#2a1a2e')
	})
})
