import React, { Component } from 'react';
import { connect } from 'react-redux';

import { headerVisibilityChange } from 'store/actions';

import ChunkyButton from 'components/chunky-button';

import Map from 'lib/map';

import './styles.scss';

class Creator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
      image: null,
      loading: false,
      map: null,
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);
    this.click = this.click.bind(this);
    this.generate = this.generate.bind(this);
    this.renderImage = this.renderImage.bind(this);
    this.erode = this.erode.bind(this);

    window.creator = this;
  }

  componentDidMount() {
    // this.props.hideHeader();
    this.setState({
      map: new Map(),
    });
    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);
  }

  componentWillUnmount() {
    this.props.showHeader();
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

  click() {
    if (this.state.loading) {
      return;
    }

    this.setState({
      loading: true,
    }, this.generate);
  }

  generate() {
    if (!this.state.map) {
      return;
    }

    this.state.map.numberOfPoints = (Math.floor(Math.random() * 11) + 6) * 500;
    this.state.map.numberOfPoints = 2000;

    this.state.map.generate().then(this.renderImage);
  }

  drawMap() {
    if (!this.state.map) {
      return;
    }

    this.state.map.draw().then(this.renderImage);
  }

  renderImage(image) {
    this.setState({
      image: image,
      loading: false,
    });
  }

  erode() {
    if (!this.state.map) {
      return;
    }

    this.state.map.mesh.niceErode();
    this.drawMap();
  }

  render() {
    let displayContent = null;
    if (this.state.image) {
      displayContent = (
        <img
          src={this.state.image}
          title="Outpost map"
          alt="A map of your outpost"
        />
      );
    }

    let mapButtons = null;

    if (this.state.map && this.state.map.mesh) {
      mapButtons = (
        <ChunkyButton onClick={this.erode} disabled={this.state.loading}>
          Erode
        </ChunkyButton>
      );
    }

    return (
      <div className="creator">
        <div
          className="display"
          style={ { height: this.state.displayHeight } }
          ref={display => this.display = display}
        >
          {displayContent}
        </div>

        <div className="toolbar">
          <ChunkyButton onClick={this.click} disabled={this.state.loading}>
            Generate
          </ChunkyButton>

          {mapButtons}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    hideHeader: () => dispatch(headerVisibilityChange(false)),
    showHeader: () => dispatch(headerVisibilityChange(true)),
  };
};

export default connect(null, mapDispatchToProps)(Creator);
