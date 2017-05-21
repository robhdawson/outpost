import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import './styles.scss';

class Header extends Component {

  render() {
    const classNames = ['header'];

    if (!this.props.isVisible) {
      classNames.push('hidden');
    }

    return (
      <div className={classNames.join(' ')}>
        <div className="header-content">
          <h1 className="header-title">
            <Link to="/">Outpost.</Link>
          </h1>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isVisible: state.headerIsVisible,
  };
};

export default connect(mapStateToProps)(Header);
