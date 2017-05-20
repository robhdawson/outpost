import React from 'react';
import { mount, shallow } from 'enzyme';

import App from './index';

it('Renders without crashing', () => {
  mount(<App />);
});

it('Renders correctly', () => {
    const app = shallow(<App />)
    expect(app).toMatchSnapshot();
});
