import { TLGeoShape, createShapeId } from '@tldraw/editor'
import { describe, expect, it } from 'vitest'
import { getGeoShapePath } from './getGeoShapePath'

function makeCrescent(overrides: Partial<TLGeoShape['props']> = {}): TLGeoShape {
	return {
		id: createShapeId(),
		typeName: 'shape',
		type: 'geo',
		x: 0,
		y: 0,
		rotation: 0,
		index: 'a1',
		parentId: 'page:page' as any,
		isLocked: false,
		opacity: 1,
		props: {
			geo: 'crescent',
			w: 200,
			h: 200,
			growY: 0,
			scale: 1,
			color: 'black',
			labelColor: 'black',
			fill: 'none',
			dash: 'draw',
			size: 'm',
			font: 'draw',
			align: 'middle',
			verticalAlign: 'middle',
			url: '',
			richText: { type: 'doc', content: [] } as any,
			...overrides,
		},
		meta: {},
	} as TLGeoShape
}

describe('crescent geo shape path', () => {
	it('produces a finite path with toD()', () => {
		const path = getGeoShapePath(makeCrescent(), 2)
		const d = path.toD()
		expect(d).toBeTruthy()
		expect(d).not.toMatch(/NaN|Infinity/)
	})

	it('produces a finite filled path with toD({ onlyFilled: true })', () => {
		const path = getGeoShapePath(makeCrescent({ fill: 'solid' }), 2)
		const d = path.toD({ onlyFilled: true })
		expect(d).toBeTruthy()
		expect(d).not.toMatch(/NaN|Infinity/)
	})

	it('produces a finite drawn path with toDrawD()', () => {
		const path = getGeoShapePath(makeCrescent({ fill: 'pattern' }), 2)
		const d = path.toDrawD({
			strokeWidth: 2,
			randomSeed: 'seed',
			passes: 1,
			offset: 0,
			onlyFilled: true,
		})
		expect(d).toBeTruthy()
		expect(d).not.toMatch(/NaN|Infinity/)
	})

	it('handles tall and wide aspect ratios', () => {
		for (const [w, h] of [
			[100, 400],
			[400, 100],
			[1, 1],
			[1, 1000],
			[1000, 1],
		]) {
			const path = getGeoShapePath(makeCrescent({ w, h }), 2)
			expect(path.toD()).not.toMatch(/NaN|Infinity/)
			expect(
				path.toDrawD({
					strokeWidth: 2,
					randomSeed: 'seed',
					passes: 1,
					offset: 0,
					onlyFilled: true,
				})
			).not.toMatch(/NaN|Infinity/)
		}
	})
})
