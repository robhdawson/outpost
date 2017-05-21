import React from 'react';
import { Link } from 'react-router';

import './styles.scss';

const Header = () => {
  return (
    <div className="header">

      <div className="header-content">
        <h1 className="header-title">
          <Link to="/">Outpost.</Link>
        </h1>
      </div>
    </div>
  );
}

export default Header;
