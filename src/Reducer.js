import { MODULE_NAME } from './consts';
import Actions from './Actions';
import Session from './Session';

/**
 * @typedef Reducer
 * 
 * @function
 * @param {Object} state The reducer state.
 * @param {Object} action The reducer action.
 */

/**
 * `createStoreSelector` searches a Redux state for a node that matches `filter` and returns
 * a function that can find that node in O(1) time in a future Redux state object.
 * 
 * @ignore
 * @param {Object} state The current Redux store state.
 * @param {func} filter The filter function.
 * @returns func
 */
export const createStoreSelector = ( state, filter ) => {
    const test = true 
        && typeof state !== "boolean"
        && typeof state !== "string"
        && typeof state !== "number"
        && typeof state !== "function"
        && state !== null && state !== undefined;
    if( test ) {
        for( let [ key, data ] of Object.entries( state ) ) {
            if( filter( data ) === true ) {
                return state => state[ key ];
            } else {
                const next = createStoreSelector( data, filter );
                if( next !== null ) {
                    return state => next( state[ key ] );
                }
            }
        }
    }
    return null;
}

/**
 * `ReducerState` is the Redux state.  
 * 
 * > *Authenticated*  
 * >> The session is *authenticated* when the `session` and `user` store values are non-empty and non-null
 * respectively.  
 * 
 * > *Guest*  
 * >> The session is in *guest* mode when the `session` and `user` store values are `""` and `null`
 * respectively.  
 * 
 * @property {boolean} rejected `true` if the server has rejected a `session-id`, `user` pair.
 * @property {boolean} resuming `true` if attempting to resume a session.
 * @property {string} session The `session-id` when *authenticated*; empty string when *guest*.
 * @property {object} user An opaque user type when *authenticated*; `null` when *guest*.
 * @property {string} username The most recently used `username` from a successful authentication.  Will also be
 * used to populate the `username` field of the `LoginForm` React component.
 */
const ReducerState = {
    // For automatic finding of the reducer key in the store.
    __module : MODULE_NAME,

    // The Gob id.
    __gobId : "",

    // True when a socket has failed to verify itself to the server.
    rejected : false,

    // True when the session is attempting to be resumed via HTTP-POST by the Authentication component; false otherwise.
    resuming : false,

    // The session-id value or empty string.
    session : "",

    // A user object as set by application or null when no user session.
    user : null,

    // The username or empty string.
    username : "",
};

/**
 * `createReducer` creates a Redux reducer attached to the given `id`.
 * 
 * @ignore
 * @param {string}  id Unique identifier shared by a `Gob`.
 * @param {Actions} actions The `Actions` instance generating actions for this `Reducer`.
 * @param {Session} session The `Session` instance that notifies `SocketPlugin` instances of changes.
 * @returns {func}
 */
export const createReducer = ( id, actions, session ) => {
    if( ! (actions instanceof Actions) ) {
        console.warn( MODULE_NAME + "/createReducer: `actions` is not an instance of `Actions`." );
    }
    if( ! (session instanceof Session) ) {
        console.warn( MODULE_NAME + "/createReducer: `session` is not an instance of `Session`." );
    }
    //
    // Reducer's init state.
    const initState = { ...ReducerState, __gobId : id };
    //
    // `authorize` and `guest` functions to cut down duplicated code.
    const authorize = ( sessionId, user ) => {
        [ session.session, session.user ] = [ sessionId, user ];
    }
    const guest = () => {
        [ session.session, session.user ] = [ "", null ];
    }
    //
    // The actual reducer as a closure.
    return ( state = initState, action ) => {
        if( ! actions.matches( action ) ) {
            return state;
        }
        switch( action.type ) {
            case actions.Types.Close: {
                guest();
                return { ...initState, username : state.username, };
            }
            
            case actions.Types.Open: {
                const { session, user, username } = action;
                authorize( session, user );
                return { ...state, rejected : false, session, user, username };
            }
            
            case actions.Types.Reject: {
                guest();
                return { ...initState, rejected : true, username : state.username, };
            }
            
            case actions.Types.ResumeBegin: {
                return { ...state, resuming : true, };
            }
            
            case actions.Types.ResumeEnd: {
                return { ...state, resuming : false, };
            }
            
            default:
                return state;
        }
    }
}
