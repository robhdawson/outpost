import React from 'react';

import './styles.scss';

const ChunkyButton = ({ children, onClick = null }) => {
  return (
    <div className="chunky-button"
      role="button"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default ChunkyButton;
