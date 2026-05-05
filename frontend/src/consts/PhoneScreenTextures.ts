export const screenTextureURLs = ['texture1.png', 'texture2.avif', 'texture3.avif'] as const
export type ScreenTextureURL = (typeof screenTextureURLs)[number]
