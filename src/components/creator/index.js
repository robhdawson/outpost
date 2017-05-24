import React, { Component } from 'react';
import { connect } from 'react-redux';

import { headerVisibilityChange } from 'store/actions';

import ChunkyButton from 'components/chunky-button';

import Map from 'lib/map';
import { randInRange } from 'lib/map/random';

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
    this.stopLoading = this.stopLoading.bind(this);

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

    this.map.numberOfPoints = randInRange(7000, 8000);
    this.map.numberOfPoints = 3000;

    // this.map.generate().then(this.renderImage);
    this.map.generateAndRenderSteps(this.renderImage, this.stopLoading);
  }

  drawMap() {
    if (!this.map) {
      return;
    }

    this.map.draw().then(this.renderImage).then(this.stopLoading);
  }

  renderImage(image) {
    this.setState({
      image: image,
    });
  }

  stopLoading() {
    this.setState({
      loading: false,
    });
  }

  erode() {
    if (!this.map) {
      return;
    }

    window.setTimeout(() => {
      this.map.mesh.findSeaLevel();
      this.map.mesh.niceErode(3);
      // this.map.mesh.relaxHeights(3);
      this.map.mesh.smoothCoast(1);
      this.map.mesh.findCoastline();

      this.drawMap();
    }, 0);
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
