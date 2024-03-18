import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TetherComponent from 'react-tether';
import Tooltip from '@mui/material/Tooltip';

import testImage from './testImage.png';

import { setDefaultDelay, isHappoRun } from '../register';

import Button from './src/Button';

export default {
  title: 'Stories',
};

class AsyncComponent extends React.Component {
  componentDidMount() {
    setTimeout(() => this.setState({ ready: true }), 80);
  }
  render() {
    if (!this.state) {
      return null;
    }
    return <span>ready!</span>;
  }
}

class UnmountFail extends React.Component {
  componentWillUnmount() {
    throw new Error('Failed');
  }
  render() {
    return <span>I throw on unmount</span>;
  }
}

function PortalComponent() {
  const domNode =
    document.getElementById('portal-root') ||
    (() => {
      const el = document.createElement('div');
      el.setAttribute('id', 'portal-root');
      document.body.appendChild(el);
      return el;
    })();
  return ReactDOM.createPortal(<h1>I'm in a portal!</h1>, domNode);
}

function TetheredComponent() {
  return (
    <TetherComponent
      attachment="top left"
      renderTarget={(ref) => <button ref={ref}>I'm the target</button>}
      renderElement={(ref) => (
        <div ref={ref} style={{ border: '1px solid red', padding: 10 }}>
          <h2>Tethered Content</h2>
          <p>A paragraph to accompany the title.</p>
        </div>
      )}
    />
  );
}

class DataFetchComponent extends React.Component {
  componentDidMount() {
    var xhr = new XMLHttpRequest();
    xhr.onload = async () => {
      this.setState({
        xhr: true,
      });
      await window.fetch('https://reqres.in/api/users?page=2');
      await window.fetch('https://reqres.in/api/users?page=3');
      this.setState({
        fetch: true,
      });
    };
    xhr.open('GET', 'https://reqres.in/api/users?page=1', true);
    xhr.send();
  }
  render() {
    if (!this.state) {
      return <div>Nothing ready</div>;
    }
    return (
      <ul>
        {this.state.xhr && <li>XHR ready</li>}
        {this.state.fetch && <li>Fetch ready</li>}
      </ul>
    );
  }
}

class AsyncContent extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      this.setState({ asyncContent: 'world!' });
    }, 1000);
  }

  render() {
    return (
      <div>
        <h1>
          Hello{' '}
          {this.state && (
            <span className="async-inner">{this.state.asyncContent}</span>
          )}
        </h1>
      </div>
    );
  }
}

function Async2() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 1000);
  }, []);
  return (
    <div data-async-ready={ready}>
      <h1>{ready ? 'Ready' : 'Not ready'}</h1>
    </div>
  );
}

function ClickToReveal() {
  const [open, setOpen] = useState(false);
  if (open) {
    return <div>I'm open</div>;
  }
  return <button onClick={() => setOpen(true)}>Open</button>;
}

export const Themed = () => (
  <div style={{ color: 'gray' }}>My color is gray</div>
);
Themed.parameters = {
  happo: { themes: ['black', 'white'] },
};

export const NotPartOfHappo = () => <AsyncComponent />;
NotPartOfHappo.parameters = { happo: false };

export const ClickToRevealStory = () => <ClickToReveal />;
ClickToRevealStory.parameters = {
  happo: {
    beforeScreenshot: ({ rootElement }) => {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      rootElement.querySelector('button').dispatchEvent(clickEvent);
    },
  },
};

export const ModifyGlobalState = () => <div>Modify Global State</div>;
ModifyGlobalState.parameters = {
  happo: {
    beforeScreenshot: () => {
      const el = document.createElement('div');
      el.id = 'global-state';
      el.innerHTML = 'clean up after me!';
      document.body.appendChild(el);

      // We should be able to fail here and still have a screenshot taken
      throw new Error('Whoopsie!');
    },
    afterScreenshot: () => {
      document.querySelector('#global-state').remove();

      // We should be able to fail here and still have execution continue
      throw new Error('Whoopsie!');
    },
  },
};

export const Lazy = () => <AsyncComponent />;
export const Portal = () => <PortalComponent />;
export const Tethered = () => <TetheredComponent />;
export const DataFetch = () => <DataFetchComponent />;
export const ExecuteAGraphQLMutationAndHandleTheResponseWhenReceived = () => (
  <div>I am done</div>
);
export const AsyncWithWaitForContent = () => <AsyncContent />;
AsyncWithWaitForContent.parameters = {
  happo: { waitForContent: 'world' },
};
export const AsyncWithWaitFor = () => <AsyncContent />;
AsyncWithWaitFor.parameters = {
  happo: { waitFor: () => document.querySelector('.async-inner') },
};

export const AsyncWithDelay = () => <AsyncContent />;
AsyncWithDelay.parameters = {
  happo: { delay: 1200 },
};

export const AsyncWithWaitForDataSelector = () => <AsyncContent />;
AsyncWithWaitForDataSelector.parameters = {
  happo: { waitFor: () => document.querySelector('[data-async-ready=true]') },
};

export const ButtonWithText = () => <Button>Hello Button</Button>;
export const ButtonFirefoxOnly = () => <Button>Hello Firefox Button</Button>;
ButtonFirefoxOnly.parameters = {
  happo: { targets: ['firefox'] },
};
export const ButtonWithImage = () => (
  <Button>
    <img src={testImage} />
  </Button>
);
export const ButtonWithStaticImage = () => (
  <Button>
    <img src="/assets/staticImage.png" />
  </Button>
);
export const ButtonWithSomeEmoji = () => (
  <Button>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);

export const MiscLarge = () => (
  <div style={{ width: 400, height: 400, backgroundColor: 'red' }} />
);
export const MiscFailingOnUnmount = () => <UnmountFail />;
export const MiscFailing = () => {
  throw new Error('Some error');
};
MiscFailing.parameters = { happo: { delay: 300 } };

export const WithTooltip = () => (
  <Tooltip title="here I am">
    <button>hover me</button>
  </Tooltip>
);
WithTooltip.parameters = {
  happo: {
    beforeScreenshot: async ({ rootElement }) => {
      rootElement.querySelector('button').dispatchEvent(
        new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: false,
        }),
      );
      // delay with 200ms to allow the animation to finish
      await new Promise((r) => setTimeout(r, 200));
    },
  },
};
