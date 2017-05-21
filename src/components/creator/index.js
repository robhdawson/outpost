import React, { Component } from 'react';
import { connect } from 'react-redux';

import { headerVisibilityChange } from 'store/actions';

import ChunkyButton from 'components/chunky-button';

import './styles.scss';

class Creator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHeight: 0,
    };

    this.updateDisplaySize = this.updateDisplaySize.bind(this);
    this.generate = this.generate.bind(this);
  }

  componentDidMount() {
    this.props.hideHeader();
    this.updateDisplaySize();
    window.addEventListener('resize', this.updateDisplaySize);
  }

  componentWillUnmount() {
    this.props.showHeader();
    window.removeEventListener('resize', this.updateDisplaySize);
  }

  updateDisplaySize() {
    console.log('hi');

    if (!this.display) {
      return;
    }

    this.setState({
      displayHeight: this.display.getBoundingClientRect().width,
    });
  }

  generate() {
    window.alert('doesn\'t do anything yet :(');
  }

  render() {
    return (
      <div className="creator">
        <div
          className="display"
          style={ { height: this.state.displayHeight } }
          ref={display => this.display = display}
        >

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
