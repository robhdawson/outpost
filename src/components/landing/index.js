import React from 'react';
import { Link } from 'react-router';

import './styles.scss';

import ChunkyButton from 'components/chunky-button';

const Landing = () => {
  const text = `
This site is a work in progress. I don't know what it is yet, honestly.
  `;

  return (
    <div className="landing">
      <div className="words">
        <p>
          {text}
        </p>
      </div>

      <Link to="/creator">
        <ChunkyButton>
          Okay
        </ChunkyButton>
      </Link>
    </div>
  );
};

export default Landing;
