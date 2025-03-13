import React from 'react';

import {
  addons,
  types,
  useParameter,
  useChannel,
  useStorybookState,
} from '@storybook/manager-api';

import { AddonPanel } from '@storybook/components';

const ADDON_ID = 'happo';
const PANEL_ID = `${ADDON_ID}/panel`;

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
        <div>
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
          <p>
            <small>
              To see function params (e.g <b>waitFor</b>) in the panel, set{' '}
              <a
                href="https://storybook.js.org/docs/api/main-config/main-config-core#channeloptionsallowfunction"
                target="_blank"
                rel="noreferrer"
              >
                <b>core.channelOptions.allowFunctions</b>
              </a>{' '}
              to <b>true</b>.
            </small>
          </p>
        </div>
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
    render: ({ active, key }) => {
      return (
        <AddonPanel active={active} key={key}>
          <HappoPanel />
        </AddonPanel>
      );
    },
  });
});
