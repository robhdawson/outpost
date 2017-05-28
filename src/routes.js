import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from 'components/app';
import Landing from 'components/landing';
import Creator from 'components/creator';
import Globe from 'components/globe';

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Landing} />
        <Route path="/map" component={Creator} />
        <Route path="/globe" component={Globe} />
    </Route>
);

export default routes;
