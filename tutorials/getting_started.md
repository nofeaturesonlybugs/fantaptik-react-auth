### Creating the Redux Reducer.

In your application's `reducer.js` or other file:
```js
import { combineReducers } from 'redux';

// Import and alias the reducer.
import { Reducer as auth } from '@fantaptik/react-auth';

// NB Import application specific reducers or other reducers.

const reducer = combineReducers( { auth } ); // NB Include other reducers.

export default reducer;
```

### Creating the Redux Store.

In your application's `store.js` or other file:
```js
import { createStore } from 'redux';

import reducer from './reducer';

const store = createStore( reducer );

export default store;
```

### Creating the Socket.

In your application's `socket.js` or other file:
```js
import { Socket } from '@fantaptik/socket';

// `SocketPlugin` is aliased to avoid name collision with other plugins you may be using.
import { SocketPlugin as AuthSocketPlugin } from '@fantaptik/react-auth';

// Create an instance of the SocketPlugin.
// Export the instance to provide access to the logout() method and React components.
export const Auth = new AuthSocketPlugin();

const socketOptions = {
    // NB See `@fantaptik/socket` for other options.
    plugins : [
        // NB Other plugins as needed...
        Auth,
    ],
};

const connection = new Socket( socketOptions );

export default connection;
```

### Using the React Components

In your application's `App.js` or other file:
```jsx
import React from 'react';

// Auth is the `SocketPlugin` instance.
//  + `Auth.React.*` provides access to components aware of the store state.
//  + `Auth.logout()` will end the authenticated session.
import { Auth } from './socket';

const App = props => {
    return (
        <div className="App">
            // Page header + navigation content.

            <Auth.React.Guest>
                <Auth.React.LoginForm uriLogin={"https://myapp.com/login"} uriResume={"https://myapp.com/resume"} />
            </Auth.React.Guest>

            <Auth.React.Authenticated>
                // NB Place components for authenticated user session here.

                // Sample logout button
                <button onClick={() => Auth.logout()}>Logout</button>
            </Auth.React.Authenticated>

            // Page footer or other content.
        </div>
    );
}

export default App;
```