import { destroy } from '@fantaptik/core';

import { MODULE_NAME } from './consts';
import Gob from './Gob';
import ServerApi from './Server';
import Session from './Session';

/**
 * `SocketPlugin` establishes a common authentication scheme for `@fantaptik/Socket`.  
 * 
 * See the **Getting Started** tutorial for example usage.  
 * 
 * > *Redux*  
 * >> `SocketPlugin` subscribes to changes in the Redux store.  
 * >> See {@link ReducerState}'s documentation for details on when a session is *authenticated* versus a *guest*.
 * 
 * > *Authentication*  
 * >> When the Redux store is *authenticated* the socket's `connect()` method is automatically called.  
 * >> The `onconnect()` handler verifies the store's session values with the server -- if this step fails 
 * the store is returned to *guest* mode.  
 * 
 * > *Guest*  
 * >> Calling `SocketPlugin`'s `logout()` method sends a message to the server to end the session.  If successful the store
 * is returned to *guest* mode.  
 * >> Whenever the store changes from *authenticated* to *guest* the `Socket`'s `stop()` method is called to prevent
 * the `Socket` from continuously trying to connect to the server when authentication is guaranteed to fail.  
 * 
 * > *Automatic Session End*  
 * >> `SocketPlugin`'s `ondata()` handler inspects incoming messages for an appropriate *session-end*
 * message.  When received the store is returned to *guest* mode.    
 * >> Use this feature to cleanly stop instances of `Socket` in connected clients when:  
 * >>> + A single session is ended by calling `logout()` as described above; i.e. one browser tab
 * calls `logout()`, the server notifies all other `Socket`s using the same session, and other browser
 * tabs will enter *guest* mode.
 * >>> + When the server is shutting down and session data will not be remembered when it starts again.  
 * 
 * > *React*  
 * >> `SocketPlugin`'s `React` property is a shortcut to the associated `Gob.React` property and provided
 * for convenience.  
 * 
 * > *Multiple Sockets*  
 * >> Multiple instances of `Socket` can use the same store however each `Socket` needs its own
 * instance of `SocketPlugin`.  
 * >> Since `SocketPlugin` calls `connect()` and `stop()` on the `Socket` instance reactively to changes in the store
 * it is sufficient to call `logout()` on a single `SocketPlugin` instance to stop all `Socket`s.  Similarly setting
 * the store to *authenticated* is sufficient to connect and authenticate all `Socket`s as well.  
 * 
 * > *Multiple Servers*  
 * >> The common use case is for an application to connect and authenticate to a single server.  The types exported
 * by this package are ideal for this case.  
 * >> Authenticating with multiple servers is possible with the use of `Gob`s.  See the **Understanding Gobs** tutorial
 * for details.  
 */
class SocketPlugin {
    /**
     * Create a new `SocketPlugin` instance that will attempt to resume our session with the server.
     * 
     * @param {Object} opts Options for `SocketPlugin`.
     * @param {func} opts.dispatch The dispatch function for the store.
     * @param {Gob} opts.gob `Gob` instance `SocketPlugin` is attached to.
     * @param {Session} opts.session `Session` instance `SocketPlugin` subscribes to.
     */
    constructor( opts ) {
        opts = opts || {};
        const { dispatch, gob, session } = opts;
        if( ! (gob instanceof Gob) ) {
            console.error( MODULE_NAME + "/SocketPlugin: opts.gob is not an instance of `Gob`." );
        }
        if( ! (session instanceof Session) ) {
            console.error( MODULE_NAME + "/SocketPlugin: opts.session is not an instance of `Session`." );
        }
        if( typeof dispatch !== "function" ) {
            console.error( MODULE_NAME + "/SocketPlugin: opts.dispatch is not a function." );
        }
        //
        // Private scope some properties.
        this.props = {
            dispatch,
            gob,
            session,
            // The `Socket` instance we are attached to.
            socket : null,
            // Subscribe to changes in session and remember the dispose function.
            unregisterSession : session.register( mode => {
                if( this.Socket ) {
                    mode === Session.AUTHENTICATED ? this.Socket.connect() : this.Socket.stop();
                }
            } ),
        };
    }

    /**
     * `destroy` cleans up the `SocketPlugin` and prevents it from reacting to changes in the Redux store
     * or events on the `Socket`.
     */
    destroy = () => {
        this.props.unregisterSession();
        delete this.props;
        destroy( this, MODULE_NAME, "SocketPlugin" );
    }

    /**
     * `logout` sends a logout message on the `Socket` to end the user session.  If successful the Redux store
     * will be set to *guest*.
     */
    logout = () => {
        const { dispatch, gob, session } = this.props;
        const message = ServerApi.Close( session.session, session.user );
        this.Socket.promise( message ).then( response => {
            if( response.success && response.success === true ) {
                dispatch( gob.Actions.Close() );
            }
        } ).catch( e => {
            console.error( MODULE_NAME + "/SocketPlugin.logout.error", e );
        } );
    }

    onconnect = () => {
        const { dispatch, gob, session } = this.props;
        const failed = () => dispatch( gob.Actions.Reject() );
        const message = ServerApi.SocketResume( session.session, session.user );
        this.Socket.promise( message ).then( response => {
            if( ! response.success || response.success !== true ) {
                    failed();
            }
        } ).catch( e => {
            console.error( MODULE_NAME + "/SocketPlugin.onconnect.error", e );
            failed();
        } );
    }

    ondata = ( event ) => {
        const { data } = event;
        if( data.type && data.type === ServerApi.Types.Close ) {
            const { dispatch, gob } = this.props;
            dispatch( gob.Actions.Close() );
        }
    };

    /**
     * `React` is a set of Redux components attached to the `store`.
     * 
     * @type {Components}
     */
    get React() {
        return this.props.gob.React;
    }

    /**
     * `Socket` is the `Socket` instance this plugin is attached to.
     * 
     * @type {Socket}
     */
    get Socket() {
        return this.props.socket;
    }

    set Socket( socketValue ) {
        const { session } = this.props;
        this.props.socket = socketValue;
        if( socketValue && session.mode === Session.AUTHENTICATED ) {
            socketValue.connect();
        }
    }
}

export default SocketPlugin;