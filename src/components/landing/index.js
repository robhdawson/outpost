import React from 'react';
import { Link } from 'react-router';

import './styles.scss';

import ChunkyButton from 'components/chunky-button';

const Landing = () => {
  return (
    <div className="landing">
      <div className="words">
        <p>
          This site is a work in progress.
        </p>
      </div>

      <Link to="/creator">
        <ChunkyButton>
          Other page &gt;
        </ChunkyButton>
      </Link>
    </div>
  );
};

export default Landing;
