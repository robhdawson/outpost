import React from 'react';

import './styles.scss';

const ChunkyButton = ({ children, onClick = null, disabled = false }) => {
  const classNames = ['chunky-button'];
  if (disabled) {
    classNames.push('disabled');
  }

  const click = disabled ? null : onClick;

  return (
    <div className={classNames.join(' ')}
      role="button"
      onClick={click}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

export default ChunkyButton;
