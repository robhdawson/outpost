import React, { Component } from 'react';

import Header from 'components/header';

import './styles.scss';


class App extends Component {
  render() {
    return (
      <div>
        <Header />

        <div className="container">
            {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
