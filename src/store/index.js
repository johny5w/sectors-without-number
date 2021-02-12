import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as toastrReducer } from 'react-redux-toastr';
import { createBrowserHistory } from 'history';
import { composeWithDevTools } from 'redux-devtools-extension';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { throttle } from 'constants/lodash';

import { loadState, saveState } from './localStorage';

import reducers from './reducers';

export const history = createBrowserHistory();
const middleware = [thunk, routerMiddleware(history)];

const store = createStore(
  combineReducers({
    ...reducers,
    toastr: toastrReducer,
    router: connectRouter(history),
  }),
  loadState(),
  composeWithDevTools(applyMiddleware(...middleware)),
);

// have at least a second delay between the local storage saves
store.subscribe(throttle(() => saveState(store.getState()), 1000));

export default store;
