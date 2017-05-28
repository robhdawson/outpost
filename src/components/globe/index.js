import React, { Component } from 'react';

import ChunkyButton from 'components/chunky-button';

import './styles.scss';

class GlobeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);
  }

  componentDidMount() {
    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);
  }

  updateDisplaySize() {
    if (!this.display) {
      return;
    }

    this.setState({
      displayHeight: this.display.getBoundingClientRect().width,
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
            ref={canvas => this.canvas = canvas}
          >
          </canvas>
        </div>

        <div className="toolbar">
          <ChunkyButton>
            New
          </ChunkyButton>
        </div>
      </div>
    );
  }
}

export default GlobeView;
