import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import routes from './routes';
import reducers from 'store/reducers';
// import registerServiceWorker from './registerServiceWorker';

import './index.scss';

const initialState = {};
const store = createStore(reducers, initialState);

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory} routes={routes} />
    </Provider>,
    document.getElementById('root')
);

// registerServiceWorker();
