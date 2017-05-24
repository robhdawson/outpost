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
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);

    this.generateClick = this.generateClick.bind(this);
    this.erodeClick = this.erodeClick.bind(this);

    this.generate = this.generate.bind(this);
    this.erode = this.erode.bind(this);

    this.renderImage = this.renderImage.bind(this);

    window.creator = this;
  }

  componentDidMount() {
    // this.props.hideHeader();
    this.map = new Map();

    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);

    this.generateClick();
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

  generateClick() {
    if (this.state.loading) {
      return;
    }

    this.setState({
      loading: true,
    }, this.generate);
  }

  erodeClick() {
    if (this.state.loading) {
      return;
    }

    this.setState({
      loading: true,
    }, this.erode);
  }

  generate() {
    if (!this.map) {
      return;
    }

    this.map.numberOfPoints = (Math.floor(Math.random() * 11) + 6) * 500;
    // this.map.numberOfPoints = 2000;

    this.map.generate().then(this.renderImage);
  }

  drawMap() {
    if (!this.map) {
      return;
    }

    this.map.draw().then(this.renderImage);
  }

  renderImage(image) {
    this.setState({
      image: image,
      loading: false,
    });
  }

  erode() {
    if (!this.map) {
      return;
    }

    this.map.mesh.findSeaLevel();
    this.map.mesh.niceErode();
    this.map.mesh.findSeaLevel();
    this.map.mesh.smoothCoast(3);
    this.map.mesh.findCoastline();

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

    if (this.map && this.map.mesh) {
      mapButtons = (
        <ChunkyButton onClick={this.erodeClick} disabled={this.state.loading}>
          Erode (kinda) (it is broken)
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
          <ChunkyButton onClick={this.generateClick} disabled={this.state.loading}>
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
