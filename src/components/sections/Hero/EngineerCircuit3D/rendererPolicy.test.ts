import { describe, expect, it } from 'vitest';
import { usesSoftwareRasterizer } from './rendererPolicy';
function rendererContext(
  label: string,
  exposeDriver = true
): WebGLRenderingContext {
  return {
    RENDERER: 7937,
    getExtension: () =>
      exposeDriver ? { UNMASKED_RENDERER_WEBGL: 37446 } : null,
    getParameter: () => label,
  } as unknown as WebGLRenderingContext;
}
describe('room renderer policy', () => {
  it.each([
    'ANGLE (Google, Vulkan SwiftShader Device)',
    'llvmpipe (LLVM 15)',
    'softpipe',
    'Microsoft Basic Render Driver',
  ])('uses a still scene for CPU driver %s', (driver) => {
    expect(usesSoftwareRasterizer(rendererContext(driver))).toBe(true);
  });
  it.each([
    'ANGLE (Apple, Apple M1, Metal)',
    'NVIDIA GeForce RTX',
    'AMD Radeon',
    'WebKit WebGL',
  ])('preserves animation for hardware or masked driver %s', (driver) => {
    expect(usesSoftwareRasterizer(rendererContext(driver))).toBe(false);
  });
  it('preserves animation when privacy settings block the driver extension', () => {
    const context = rendererContext('WebKit WebGL', false);
    expect(usesSoftwareRasterizer(context)).toBe(false);
    context.getExtension = () => {
      throw new Error('blocked');
    };
    expect(usesSoftwareRasterizer(context)).toBe(false);
  });
});
