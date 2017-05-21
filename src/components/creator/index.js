import React, { Component } from 'react';
import { connect } from 'react-redux';

import { headerVisibilityChange } from 'store/actions';

class Creator extends Component {
    componentDidMount() {
      this.props.hideHeader();
    }

    componentWillUnmount() {
      this.props.showHeader();
    }

    render() {
        return (
            <div>
              content
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
