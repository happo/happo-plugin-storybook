import React from 'react'

import {
  useChannel,
  useParameter,
  useStorybookState,
} from '@storybook/manager-api'

import { AddonPanel } from '@storybook/components'

import { EVENTS, PARAM_KEY } from './constants'

export function Panel(props: any) {
  const happoParams = useParameter(PARAM_KEY, null)
  const state = useStorybookState()
  const emit = useChannel({})

  return (
    <AddonPanel {...props}>
      <div
        style={{
          padding: 10,
          fontSize: 12,
        }}>
        {happoParams ? (
          <table>
            <tbody>
              {Object.keys(happoParams).map((key) => {
                const val = happoParams[key]
                return (
                  <tr key={key}>
                    <td>
                      <code>{key}:</code>
                    </td>
                    <td>
                      {typeof val === 'function' ? (
                        <button
                          onClick={() =>
                            emit(EVENTS.EVENT, {
                              storyId: state.storyId,
                              funcName: key,
                            })
                          }>
                          Invoke
                        </button>
                      ) : (
                        <code>{JSON.stringify(val)}</code>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div>No happo params for this story</div>
        )}
      </div>
    </AddonPanel>
  )
}
