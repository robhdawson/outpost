import React, { Component } from 'react';

import ChunkyButton from 'components/chunky-button';
import Loader from 'components/loader';

import Map from 'lib/map';

import './styles.scss';

class Creator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
      loading: false,
      image: null,
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);

    this.generateClick = this.generateClick.bind(this);
    this.generate = this.generate.bind(this);

    this.renderImage = this.renderImage.bind(this);
    this.stopLoading = this.stopLoading.bind(this);
  }

  componentDidMount() {
    this.map = new Map();

    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);

    this.generateClick();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDisplaySize);
  }

  updateDisplaySize() {
    if (!this.display) {
      return;
    }

    this.setState({
      displayHeight: this.display.getBoundingClientRect().width,
    });
  }

  generateClick() {
    if (this.state.loading) {
      return;
    }

    this.startLoading();
    this.generate();
  }

  generate() {
    if (!this.map) {
      return;
    }

    this.map.numberOfPoints = 10000;

    setTimeout(() => {
      this.map.generate();
      this.renderImage(this.map.image);
      this.stopLoading();
    }, 1000);
  }

  renderImage(image) {
    this.setState({
      image,
    });
  }

  startLoading() {
    this.setState({
      image: null,
      loading: true,
    });
  }

  stopLoading() {
    this.setState({
      loading: false,
    });
  }

  render() {
    let content;

    if (this.state.image) {
      content = (
        <img
          title="Outpost map"
          alt="A map of your outpost"
          src={this.state.image}
        />
      );
    } else {
      content = <Loader size={this.state.displayHeight / 1.8} />
    }

    return (
      <div className="creator">
        <div
          className="display"
          style={ { height: this.state.displayHeight } }
          ref={display => this.display = display}
        >
          {content}
        </div>

        <div className="toolbar">
          <ChunkyButton onClick={this.generateClick} disabled={this.state.loading}>
            New
          </ChunkyButton>
        </div>
      </div>
    );
  }
}

export default Creator;
