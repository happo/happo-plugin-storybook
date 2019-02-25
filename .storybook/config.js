import React from 'react';
import ReactDOM from 'react-dom';
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

window.onbeforeunload = function(e) {
  throw 'Failed to render because a page load event was fired';
};

class UnmountFail extends React.Component {
  componentWillUnmount() {
    throw new Error('Failed');
  }
  render() {
    return <span>I throw on unmount</span>;
  }
};

function PortalComponent() {
  const domNode = document.getElementById('portal-root') || (() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'portal-root');
    document.body.appendChild(el);
    return el;
  })();
  return ReactDOM.createPortal(
    (<h1>I'm in a portal!</h1>),
    domNode
  );
}

function loadStories() {
  if (!isHappoRun()) {
    storiesOf('NOT PART OF HAPPO', module).add('default', () => (
      <AsyncComponent />
    ));
  }
  storiesOf('Lazy', module).add('default', () => <AsyncComponent />);
  storiesOf('Portal', module).add('default', () => <PortalComponent />);

  storiesOf('Button', module)
    .add('with text', () => <Button>Hello Button</Button>, {
      happo: { delay: 2000 },
    })
    .add('with image', () => (
      <Button>
        <img src={testImage} />
      </Button>
    ))
    .add('large', () => (
      <div style={{ width: 400, height: 400, backgroundColor: 'red' }} />
    ))
    .add('failing on unmount', () => {
      return (
        <UnmountFail />
      );
    })
    .add('failing', () => {
      throw new Error('Some error');
      return (
        <Button>
          <img src={testImage} />
        </Button>
      );
    }, { happo: { delay: 300 } })
    .add('with some emoji', () => (
      <Button>
        <span role="img" aria-label="so cool">
          😀 😎 👍 💯
        </span>
      </Button>
    ));
}

configure(loadStories, module);
