import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from 'components/app';
import Landing from 'components/landing';
import Creator from 'components/creator';

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Landing} />
        <Route path="/creator" component={Creator} />
    </Route>
);

export default routes;
