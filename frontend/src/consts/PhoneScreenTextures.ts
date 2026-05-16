const PREFIX = 'textures/'
export const screenTextureURLs = [`${PREFIX}texture1.avif`, `${PREFIX}texture2.avif`, `${PREFIX}texture3.avif`] as const
export type ScreenTextureURL = (typeof screenTextureURLs)[number]
