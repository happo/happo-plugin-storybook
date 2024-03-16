declare module '*.png' {
  const content: any
  export default content
}

declare namespace globalThis {
  interface Window {
    happoTime?: {
        originalDateNow: typeof Date.now,
        originalSetTimeout: typeof window.setTimeout
    },
    happo?: {
        init?: (config: any) => void,
        nextExample?: () => Promise<void | {component: any, variant: any}>
    },
    __STORYBOOK_CLIENT_API__: any,
    __STORYBOOK_PREVIEW__: any,
    __STORYBOOK_ADDONS_CHANNEL__: any,
    __IS_HAPPO_RUN?: boolean,
  }
}
