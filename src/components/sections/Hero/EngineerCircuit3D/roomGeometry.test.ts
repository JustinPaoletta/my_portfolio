import { describe, expect, it } from 'vitest';
import { Mesh } from 'three';
import {
  cableRoute,
  createEngineerRoom,
  POWER_BAYS,
  indicatorBrightness,
} from './roomGeometry';

describe('engineer room geometry', () => {
  for (const mode of ['dark', 'light'] as const) {
    it(`${mode} stays inside the production geometry and draw-call budgets`, () => {
      const room = createEngineerRoom(mode);
      let calls = 0,
        triangles = 0;
      room.root.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        calls++;
        const count = 'count' in object ? Number(object.count) : 1;
        triangles +=
          ((object.geometry.index?.count ??
            object.geometry.attributes.position.count) /
            3) *
          count;
        expect(
          Array.from(object.geometry.attributes.position.array).every(
            Number.isFinite
          )
        ).toBe(true);
      });
      expect(calls).toBeLessThanOrEqual(20);
      expect(triangles).toBeLessThanOrEqual(50000);
      room.dispose();
    });
  }
  it('provides a conspicuous on/off flash rather than an imperceptible brightness drift', () => {
    const levels = Array.from({ length: 160 }, (_, i) =>
      indicatorBrightness(i / 100, 0)
    );
    expect(Math.max(...levels) / Math.min(...levels)).toBeGreaterThan(100);
    const onFrames = levels.filter((level) => level > 1).length;
    expect(onFrames).toBeGreaterThan(20);
    expect(onFrames).toBeLessThan(50);
  });
  it('terminates every power lead inside module and bus connector envelopes', () => {
    for (const z of POWER_BAYS)
      for (let lane = 0; lane < 3; lane++) {
        const route = cableRoute(z, lane),
          start = route[0],
          end = route.at(-1)!;
        expect(start.x).toBeGreaterThan(3.6);
        expect(start.x).toBeLessThan(4.7);
        expect(start.y).toBeGreaterThan(1.84);
        expect(start.y).toBeLessThan(2.01);
        expect(start.z).toBeGreaterThan(z - 0.825);
        expect(start.z).toBeLessThan(z + 0.825);
        expect(end.x).toBeGreaterThan(4.65);
        expect(end.x).toBeLessThan(4.99);
        expect(end.y).toBeGreaterThan(2.93);
        expect(end.y).toBeLessThan(3.31);
        expect(end.z).toBeGreaterThan(-8.65);
        expect(end.z).toBeLessThan(4.05);
      }
  });
  it('keeps capture time deterministic while animating independent rotors and indicators', () => {
    const room = createEngineerRoom('dark');
    room.animate(0);
    const initial = room.indicators.instanceColor!.array.slice();
    room.animate(1);
    expect(room.rotors.every((rotor) => rotor.rotation.z !== 0)).toBe(true);
    expect(Array.from(room.indicators.instanceColor!.array)).not.toEqual(
      Array.from(initial)
    );
    room.animate(0);
    expect(room.rotors.every((rotor) => rotor.rotation.z === 0)).toBe(true);
    expect(Array.from(room.indicators.instanceColor!.array)).toEqual(
      Array.from(initial)
    );
    room.dispose();
  });
});
