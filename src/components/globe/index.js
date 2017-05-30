import React, { Component } from 'react';

import ChunkyButton from 'components/chunky-button';

import Globe from 'lib/globe';

import './styles.scss';

class GlobeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
      loading: false,
    };

    window.c = this;

    this.updateDisplaySize = this.updateDisplaySize.bind(this);
    this.generate = this.generate.bind(this);
    this.makeGif = this.makeGif.bind(this);
  }

  componentDidMount() {
    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);

    window.setTimeout(() => {
      this.globe = new Globe();
      this.globe.attach(this.canvas, this.forceUpdate.bind(this));
      this.generate();
    }, 10);
  }

  componentWillUnmount() {
    if (this.globe) {
      this.globe.detach();
      delete this.globe;
    }
  }

  updateDisplaySize() {
    if (!this.display) {
      return;
    }

    const displayHeight = this.display.getBoundingClientRect().width;

    this.setState({
      displayHeight,
    });
  }

  generate() {
    this.globe.reset();
    this.globe.generate();
  }

  makeGif() {
    this.setState({
      loading: true,
    });

    window.setTimeout(() => {
      this.globe.makeGif((img) => {
        const a = document.createElement('a');
        a.setAttribute('href', img);

        a.setAttribute('download', 'outpost.gif');
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.setState({
          loading: false,
        });
      });
    }, 10);
  }

  render() {
    const classNames = ['display'];

    if (this.state.loading) {
      classNames.push('loading');
    }

    return (
      <div className="creator">
        <div
          className={classNames.join(' ')}
          style={ { height: this.state.displayHeight } }
          ref={display => this.display = display}
        >
          <div className="loader">
            Loading...
          </div>

          <canvas
            width="500"
            height="500"
            ref={canvas => this.canvas = canvas}
          >
          </canvas>
        </div>

        <div className="toolbar">
          <ChunkyButton onClick={this.generate} disabled={this.state.loading}>
            New
          </ChunkyButton>

          <ChunkyButton onClick={this.makeGif} disabled={this.state.loading || !(this.globe && this.globe.done)}>
            Download as GIF
          </ChunkyButton>
        </div>

        <div className="hint">
          (you can drag the globe around)
        </div>
      </div>
    );
  }
}

export default GlobeView;
