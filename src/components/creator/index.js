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
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);
    this.generate = this.generate.bind(this);
  }

  componentDidMount() {
    // this.props.hideHeader();

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

  generate() {
    this.map = new Map();
    window.map = this.map;
    this.map.generate().then(image => {
      this.setState({
        image: image,
      });
    });
  }

  render() {
    let displayContent = null;
    if (this.state.image) {
      displayContent = (
        <img src={this.state.image} alt="A map" />
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
          <ChunkyButton onClick={this.generate}>
            Generate
          </ChunkyButton>
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
