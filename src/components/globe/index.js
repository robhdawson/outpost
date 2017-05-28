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
  }

  componentDidMount() {
    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);

    window.setTimeout(() => {
      this.globe = new Globe();
      this.globe.attach(this.canvas);

      window.setTimeout(() => {
        this.generate();
      });
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
    this.globe.generate();


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
            width={this.state.displayHeight}
            height={this.state.displayHeight}
            ref={canvas => this.canvas = canvas}
          >
          </canvas>
        </div>

        <div className="toolbar">
          <ChunkyButton onClick={this.generate}>
            New
          </ChunkyButton>
        </div>
      </div>
    );
  }
}

export default GlobeView;
