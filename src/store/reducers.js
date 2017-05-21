import { combineReducers } from 'redux';

import { HEADER_VISIBILITY_CHANGE } from './actions.js';

export function headerIsVisible(state = true, action) {
  if (action.type ===  HEADER_VISIBILITY_CHANGE) {
    return action.isVisible;
  };

  return state;
}

export default combineReducers({
  headerIsVisible,
});
