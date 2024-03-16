import React from 'react';

import { addons, types } from '@storybook/manager-api';
import { useParameter, useChannel, useStorybookState } from '@storybook/api';

import { AddonPanel } from '@storybook/components';
import { ADDON_ID, PANEL_ID } from 'src/constants';

function HappoPanel() {
  const happoParams = useParameter('happo', null);
  const state = useStorybookState();
  const emit = useChannel({});

  return (
    <div
      style={{
        padding: 10,
        fontSize: 12,
      }}
    >
      {happoParams ? (
        <table>
          <tbody>
            {Object.keys(happoParams).map((key) => {
              const val = happoParams[key];
              return (
                <tr key={key}>
                  <td>
                    <code>{key}:</code>
                  </td>
                  <td>
                    {typeof val === 'function' ? (
                      <button
                        onClick={() =>
                          emit('happo-event', {
                            storyId: state.storyId,
                            funcName: key,
                          })
                        }
                      >
                        Invoke
                      </button>
                    ) : (
                      <code>{JSON.stringify(val)}</code>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>No happo params for this story</div>
      )}
    </div>
  );
}

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Happo',
    render: ({ active, key }: any) => {
      return (
        <AddonPanel active={active} key={key}>
          <HappoPanel />
        </AddonPanel>
      );
    },
  });
});