import React from 'react';

import './styles.scss';

const Loader = ({ size }) => {
  return (
    <div className="loader-container" >
      <div
        className="loader-container-inner"
        style={{
          width: size,
          height: size,
          fontSize: size/12,
          letterSpacing: size/24,
        }}
      >
        LOADING

        <div className="loader-units">
          <div className="one"></div>
          <div className="two"></div>
          <div className="three"></div>
          <div className="four"></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;