import type {
  Renderer,
  PartialStoryFn as StoryFunction,
  StoryContext,
} from "@storybook/types";
import { addons, useEffect, useParameter } from '@storybook/preview-api'
import { SB_ROOT_ELEMENT_SELECTOR, EVENTS, PARAM_KEY } from './constants'

export function withHappo(
  StoryFn: StoryFunction<Renderer>,
  context: StoryContext<Renderer>
) {
    const parameters = useParameter<any>(PARAM_KEY, {})
    useEffect(() => {
      const channel = addons.getChannel()
      function listen({ funcName }: {funcName: string}) {
        const rootElement = document.querySelector(SB_ROOT_ELEMENT_SELECTOR)
        parameters[funcName]({ rootElement })
      }
      channel.on(EVENTS.EVENT, listen)
      return () => channel.off(EVENTS.EVENT, listen)
    }, [])
    return StoryFn(context)
}