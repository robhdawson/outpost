import React, { Component } from 'react';

import ChunkyButton from 'components/chunky-button';

import Globe from 'lib/globe';

import './styles.scss';

class GlobeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
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
  }

  render() {
    return (
      <div className="creator">
        <div
          className="display"
          style={ { height: this.state.displayHeight } }
          ref={display => this.display = display}
        >
          <canvas
            width="540"
            height="540"
            ref={canvas => this.canvas = canvas}
          >
          </canvas>
        </div>

        <div className="toolbar">
          <ChunkyButton onClick={this.generate}>
            New
          </ChunkyButton>

          <ChunkyButton onClick={this.makeGif} disabled={!(this.globe && this.globe.done)}>
            Download as GIF
          </ChunkyButton>
        </div>
      </div>
    );
  }
}

export default GlobeView;
