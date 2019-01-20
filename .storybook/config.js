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

function loadStories() {
  if (!isHappoRun()) {
    storiesOf('NOT PART OF HAPPO', module).add('default', () => <AsyncComponent />);
  }
  storiesOf('Lazy', module).add('default', () => <AsyncComponent />);

  storiesOf('Button', module)
    .add('with text', () => <Button>Hello Button</Button>, { happo: { delay: 2000 } })
    .add('with image', () => (
      <Button>
        <img src={testImage} />
      </Button>
    ))
    .add('with some emoji', () => (
      <Button>
        <span role="img" aria-label="so cool">
          😀 😎 👍 💯
        </span>
      </Button>
    ));
}

configure(loadStories, module);
