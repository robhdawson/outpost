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

      <div className="links">
        <Link to="/map">
          <ChunkyButton>
            Map
          </ChunkyButton>
        </Link>


        <Link to="/globe">
          <ChunkyButton>
            Globe
          </ChunkyButton>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
