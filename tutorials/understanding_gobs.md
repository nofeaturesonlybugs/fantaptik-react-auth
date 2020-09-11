###  The Simple Case  

The primary purpose of this package is to simplify authentication and create authenticated socket connections to a
server.  When you create an instance of `SocketPlugin` and attach it to a `Socket` then that `Socket` will connect,
authenticate, and close itself depending on the changing Redux state.  If you create multiple such `Socket` instances
(each with its own instance of `SocketPlugin`) then they will all connect, authenticate, and close themselves as
the Redux state changes.

If your application is only authenticating with a single server then there's nothing extra you need to do with
`Gob`s -- your case is the simple case where all sockets communicate with a single server.  

### The Complicated Case  

The complicated case occurs when you want to create multiple authorized socket connections to different servers.
It would be undesirable for sockets pointed at *ServerA* to connect or disconnect due to session changes for
*ServerB*.  This is where `Gob`s enter the story -- they effectively namespace or slice their behavior to
a subsection of the Redux state.

### The \_\_global\_\_ Gob  

The simple truth is there is always an active `Gob` with the namespace *"\_\_global\_\_"*.

The following exports from this package are all tied to the global `Gob`:  
* Actions  
* Reducer  
* SocketPlugin  
* Components  

### A `Gob` Example  

**Remember that you do not need to create or use instances of `Gob` if your application authenticates with a single server!**  

> #### Create the Gob.  
> Create a file for the `Gob`; we'll call it `secondService.js`.
> ```js
> import { Gob } from '@fantaptik/react-auth';
> const instance = new Gob( "second-service" ); // NB:  Do not create any other Gobs from this package with this name!
> export const Actions          = instance.Actions;
> export const Reducer          = instance.Reducer;
> export const SocketPlugin     = instance.SocketPlugin;
> export const Components       = instance.React;
> export default instance;
> ```

> #### Creating the Redux Reducer.  
> In your application's `reducer.js` or other file:  
> ```js
> import { combineReducers } from 'redux';
> 
> // Import and alias the reducer.
> import { Reducer as auth } from '@fantaptik/react-auth';          // Reducer for __global__ Gob.
> import { Reducer as secondService } from './secondService.js';    // Reducer for second-service Gob.
> 
> // NB Import application specific reducers or other reducers.
> 
> const reducer = combineReducers( { auth, secondService } ); // NB Include other reducers.
>
> export default reducer;
> ```  
> Your reducers do not need to be at the top-level of your Redux state -- you can nest them further down
> and the `Gob`s will locate them when necessary:  
> ```js
> import { combineReducers } from 'redux';
> 
> // Import and alias the reducer.
> import { Reducer as auth } from '@fantaptik/react-auth';          // Reducer for __global__ Gob.
> import { Reducer as secondService } from './secondService.js';    // Reducer for second-service Gob.
> 
> // NB Import application specific reducers or other reducers.
> const auths = combineReducers( { auth, secondService } );
> const reducer = combineReducers( { auths } ); // NB Include other reducers.
>
> export default reducer;
> ```  

> #### Creating the Redux Store.  
> In your application's `store.js` or other file:  
> ```js
> import { createStore } from 'redux';
> 
> import reducer from './reducer';
> 
> const store = createStore( reducer );
> 
> export default store;
> ```  

> #### Creating the Socket.  
> In your application's `socket.js` or other file:  
> ```js
> import { Socket } from '@fantaptik/socket';
> 
> import { SocketPlugin as AuthSocketPlugin } from '@fantaptik/react-auth';
> import { SocketPlugin as SecondAuthSocketPlugin } from './secondService.js';
> 
> export const Auth = new AuthSocketPlugin();               // __global__ Gob
> const socketOptions = {                                   // __global__ Gob
>     // NB See `@fantaptik/socket` for other options.      // __global__ Gob
>     plugins : [                                           // __global__ Gob
>         // NB Other plugins as needed...                  // __global__ Gob
>         Auth,                                             // __global__ Gob
>     ],                                                    // __global__ Gob
> };                                                        // __global__ Gob
> export const connection = new Socket( socketOptions );    // __global__ Gob
> 
> export const SecondAuth = new SecondAuthSocketPlugin();   // second-service Gob
> const secondOptions = {                                   // second-service Gob
>     // NB See `@fantaptik/socket` for other options.      // second-service Gob
>     plugins : [                                           // second-service Gob
>         // NB Other plugins as needed...                  // second-service Gob
>         SecondAuth,                                       // second-service Gob
>     ],                                                    // second-service Gob
> };                                                        // second-service Gob
> export const secondary = new Socket( secondOptions );     // second-service Gob
> ```

> #### Using the React Components  
> In your application's `App.js` or other file:  
> ```jsx  
> import React from 'react';
> 
> import { Auth, SecondAuth } from './socket';
> 
> const App = props => {
>     return (
>         <div className="App">
>             // Page header + navigation content.
> 
>             <Auth.React.Guest>
>                 <Auth.React.LoginForm uriLogin={"https://myapp.com/login"} uriResume={"https://myapp.com/resume"} />
>             </Auth.React.Guest>
> 
>             <Auth.React.Authenticated>
>                 // NB Place components for authenticated user session here.
> 
>                 // Sample logout button
>                 <button onClick={() => Auth.logout()}>Logout</button>
>             </Auth.React.Authenticated>
> 
>             <SecondAuth.React.Guest>
>                 <SecondAuth.React.LoginForm uriLogin={"https://second-service.com/login"} uriResume={"https://second-service.com/resume"} />
>             </SecondAuth.React.Guest>
> 
>             <SecondAuth.React.Authenticated>
>                 // NB Place components for authenticated user session here.
> 
>                 // Sample logout button
>                 <button onClick={() => SecondAuth.logout()}>Logout</button>
>             </SecondAuth.React.Authenticated>
> 
>             // Page footer or other content.
>         </div>
>     );
> }
> 
> export default App;
> ```  