import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TetherComponent from 'react-tether';
import { configure } from '@storybook/react';
import { storiesOf } from '@storybook/react';

import testImage from './testImage.png';

import { setDefaultDelay, isHappoRun } from '../register';

import Button from './src/Button';

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

setDefaultDelay(1);

window.onbeforeunload = function (e) {
  throw 'Failed to render because a page load event was fired';
};

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
      renderTarget={ref => <button ref={ref}>I'm the target</button>}
      renderElement={ref => (
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

function ClickToReveal() {
  const [open, setOpen] = useState(false);
  if (open) {
    return <div>I'm open</div>;
  }
  return <button onClick={() => setOpen(true)}>Open</button>;
}

function loadStories() {
  if (!isHappoRun()) {
    storiesOf('NOT PART OF HAPPO', module).add('default', () => (
      <AsyncComponent />
    ));
  }
  storiesOf('ALSO NOT PART OF HAPPO', module).add(
    'default',
    () => <AsyncComponent />,
    { happo: false },
  );
  storiesOf('ClickToReveal', module).add('default', () => <ClickToReveal />, {
    happo: {
      beforeScreenshot: () => {
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: false,
        });
        document.querySelector('button').dispatchEvent(clickEvent);
      },
    },
  });
  storiesOf('Modify Global State', module).add(
    'default',
    () => <div>Modify Global State</div>,
    {
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
    },
  );
  storiesOf('Lazy', module).add('default', () => <AsyncComponent />);
  storiesOf('Portal', module).add('default', () => <PortalComponent />);
  storiesOf('Tethered', module).add('default', () => <TetheredComponent />);
  storiesOf('Data Fetch', module).add('default', () => <DataFetchComponent />);
  storiesOf(
    'Long Variant Names',
    module,
  ).add(
    'Execute a GraphQL mutation and handle the response when received.',
    () => <div>I am done</div>,
  );
  storiesOf('Async Content', module)
    .add('with waitForContent', () => <AsyncContent />, {
      happo: { waitForContent: 'world' },
    })
    .add('with waitFor', () => <AsyncContent />, {
      happo: { waitFor: () => document.querySelector('.async-inner') },
    })
    .add('with delay', () => <AsyncContent />, {
      happo: { delay: 1200 },
    });

  storiesOf('Button', module)
    .add('with text', () => <Button>Hello Button</Button>, {
      happo: { delay: 2000 },
    })
    .add('with image', () => (
      <Button>
        <img src={testImage} />
      </Button>
    ))
    .add('with static image', () => (
      <Button>
        <img src="/assets/staticImage.png" />
      </Button>
    ))
    .add('with some emoji', () => (
      <Button>
        <span role="img" aria-label="so cool">
          😀 😎 👍 💯
        </span>
      </Button>
    ));

  storiesOf('Misc', module)
    .add('large', () => (
      <div style={{ width: 400, height: 400, backgroundColor: 'red' }} />
    ))
    .add('failing on unmount', () => {
      return <UnmountFail />;
    })
    .add(
      'failing',
      () => {
        throw new Error('Some error');
        return (
          <Button>
            <img src={testImage} />
          </Button>
        );
      },
      { happo: { delay: 300 } },
    );
}

configure(loadStories, module);
