import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from 'components/app';
import Landing from 'components/landing';
import Creator from 'components/creator';

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Creator} />
        <Route path="/what" component={Landing} />
    </Route>
);

export default routes;
