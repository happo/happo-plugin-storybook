import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from '@storybook/react';
import { storiesOf } from '@storybook/react';

import testImage from './testImage.png';

import { onBeforeRender, setDefaultDelay, isHappoRun } from '../register';

import Button from './src/Button';

let globalState = 'Mexico';
onBeforeRender(() => {
  globalState = globalState + '!';
});

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

function loadStories() {
  if (!isHappoRun()) {
    storiesOf('NOT PART OF HAPPO', module).add('default', () => (
      <AsyncComponent />
    ));
  }

  storiesOf('Hooked', module)
    .add('first render', () => <h1>{globalState}</h1>)
    .add('second render', () => <h1>{globalState}</h1>);

  storiesOf('Lazy', module).add('default', () => <AsyncComponent />);

  storiesOf('Button', module)
    .add('with text', () => <Button>Hello Button</Button>, {
      happo: { delay: 2000 },
    })
    .add('with image', () => (
      <Button>
        <img src={testImage} />
      </Button>
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
