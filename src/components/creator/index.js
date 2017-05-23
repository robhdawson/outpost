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
    this.click = this.click.bind(this);
    this.generate = this.generate.bind(this);
  }

  componentDidMount() {
    // this.props.hideHeader();
    this.map = new Map();
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
    this.map.numberOfPoints = (Math.floor(Math.random() * 11) + 6) * 500;
    // this.map.numberOfPoints = 100;

    this.map.generate().then(image => {
      this.setState({
        image: image,
        loading: false,
      });
    });
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
