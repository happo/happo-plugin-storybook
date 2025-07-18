import React from 'react';
import { addons, types, useParameter } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';

const ADDON_ID = 'happo';
const PANEL_ID = `${ADDON_ID}/panel`;

function HappoPanel() {
  const happoParams = useParameter('happo', null);

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
                    <code>{JSON.stringify(val)}</code>
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
    render: ({ active, key }) => {
      return (
        <AddonPanel active={active} key={key}>
          <HappoPanel />
        </AddonPanel>
      );
    },
  });
});
