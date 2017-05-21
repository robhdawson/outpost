import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from 'components/header';

import './styles.scss';


class App extends Component {
  render() {

    const containerClassNames = ['container'];

    if (!this.props.headerIsVisible) {
      containerClassNames.push('no-header');
    }

    return (
      <div>
        <Header />

        <div className={containerClassNames.join(' ')}>
            {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    headerIsVisible: state.headerIsVisible,
  };
};

export default connect(mapStateToProps)(App);
