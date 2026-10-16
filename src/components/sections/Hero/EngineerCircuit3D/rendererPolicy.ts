/** Keep CPU graphics fallback usable; never infer a software renderer from a hidden driver label. */
export function usesSoftwareRasterizer(
  context: WebGLRenderingContext | WebGL2RenderingContext
): boolean {
  try {
    const info = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(
      context.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? context.RENDERER)
    );
    return /swiftshader|llvmpipe|softpipe|software (?:renderer|rasterizer)|microsoft basic render driver/i.test(
      renderer
    );
  } catch {
    // Privacy-restricted extension queries must not disable supported GPUs.
    return false;
  }
}
