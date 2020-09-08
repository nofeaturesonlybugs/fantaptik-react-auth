import { LocalStorage } from '@fantaptik/core';

import { MODULE_NAME } from './consts';

import { createReducer, createStoreSelector } from './Reducer';
import Actions from './Actions';
import Session from './Session';
import SocketPlugin from './SocketPlugin';
import GobFactory from './components/GobFactory';

/**
 * `Gob` combines {@link Actions}, {@link SocketPlugin}, {@link Reducer} and the {@link Components} into a shared namespace.  
 * 
 * Without `Gob` this package could only authenticate to a single server as all instances of `SocketPlugin` would
 * be bound to the same Redux state.  
 * 
 * With `Gob` this package can authenticate with multiple servers that implement the *Server API* with each server's Redux
 * state separated within the store.  
 * 
 * **Important** `Gob.dispatcher` needs to be set to the Redux store's dispatch function.  This will happen automatically
 * if you mount either `Gob.React.Guest` or `Gob.React.Authenticated` within your application.  If you do not mount
 * either of those components then you need to set `dispatcher` explicitly after creating your Redux store.  
 * 
 * @class
 */
class Gob {
    /**
     * Creates a new `Gob`.
     * 
     * @param {string} id The id common to the elements in the `Gob`.
     */
    constructor( id ) {
        //
        // Privatize some properties.
        const actions = new Actions( id );
        const session = new Session();
        const reducer = createReducer( id, actions, session );
        const storage = new LocalStorage( { prefix : `${MODULE_NAME}/Gob/${id}/` } );
        this.props = {
            id,
            actions,
            reducer,
            session,
            storage,
            // The `dispatch` function for the Redux store.
            dispatcher : null,
            // The Redux store selector function.
            storeSelector : null,
            // Queued actions from `SocketPlugin` instances since they do not have a handle to the
            // true dispatch method for the store.
            dispatchQueue : [],
            // The React components.
            components : GobFactory( this ),
        };
    }

    /**
     * `storage` is the `LocalStorage` instance attached to this `Gob`.
     * 
     * @type {LocalStorage}
     */
    get storage() {
        return this.props.storage;
    }

    /**
     * `id` is the `id` value the `Gob` was created with.
     * 
     * @readonly
     * @type string
     */
    get id() {
        return this.props.id;
    }

    /**
     * `dispatcher` is the `dispatch` function tied to the Redux store and must be set for `SocketPlugin` instances
     * to communicate with the Redux store.  
     * 
     * Mounting `Gob.React.Guest` or `Gob.React.Authenticated` in the application will set this property automatically.  If not
     * mounting either of those components then you will need to set this property explicitly after creating your Redux
     * store.  
     * 
     * @type {func}
     */
    set dispatcher( dispatcherValue ) {
        if( this.props.dispatcher === null ) {
            this.props.dispatcher = dispatcherValue;
            while( this.props.dispatchQueue.length > 0 ) {
                this.props.dispatcher( this.props.dispatchQueue.shift() );
            }
        }
    }

    /**
     * `Actions` are the Redux actions dispatched by this `Gob`.
     * 
     * @readonly
     * @type {Actions}
     */
    get Actions() {
        return this.props.actions;
    }

    /**
     * `React` returns React components for this `Gob`.
     * 
     * @readonly
     * @type {Components}
     */
    get React() {
        return this.props.components;
    }

    /**
     * `Reducer` is the Redux reducer tied to this `Gob`.
     * 
     * @readonly
     * @type {Reducer}
     */
    get Reducer() {
        return this.props.reducer;
    }

    /**
     * `SocketPlugin` is a constructor to create instances of `SocketPlugin` tied to this `Gob`.  
     * 
     * When using this constructor you do not need to pass the `gob`, `session`, or `dispatch` members of
     * the `SocketPlugin` options.
     * 
     * @method
     */
    SocketPlugin = ( opts ) => {
        const { session } = this.props;
        // Set options and create instance.
        opts = opts || {};
        opts = { 
            ...opts, 
            // Pass a `dispatch` function that queues or immediately dispatches the action depending
            // on if the `Gob` has a dispatcher or not.
            dispatch : ( action ) => {
                const { dispatcher, dispatchQueue } = this.props;
                dispatcher === null ? dispatchQueue.push( action ) : dispatcher( action );
            },
            gob : this,
            session,
        };
        const instance = new SocketPlugin( opts );
        return instance;
    }

    /**
     * `storeToProps` is the function used as the first argument to `connect()` when binding a React component
     * to Redux.
     * 
     * @method
     * @param {Object} state The Redux store state.
     */
    storeToProps = ( state ) => {
        if( this.props.storeSelector === null ) {
            this.props.storeSelector = createStoreSelector( state, item => {
                const { __module, __gobId } = item || {};
                return __module == MODULE_NAME && __gobId == this.props.id;
            } );
        }
        return this.props.storeSelector( state );
    }
}

export default Gob;