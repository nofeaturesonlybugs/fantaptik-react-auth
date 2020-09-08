import { destroy, Events } from '@fantaptik/core';

import { MODULE_NAME } from './consts';

const AUTHENTICATED = true;
const GUEST = false;

const EVENT_SESSION_MODE = "session-mode";

/**
 * `Session` stores the session data; i.e. `session` and `user` data.  
 * 
 * This is a helper class that notifies when the session data switch from `guest` to `authenticated` or `authenticated`
 * to `guest`.  It exists because `SocketPlugin` instances need to subscribe to these changes but they do not directly
 * subscribe to the Redux store nor are they nested in a React component that reacts to changes in the store.
 * 
 * @class
 * @ignore
 */
class Session {
    static AUTHENTICATED    = AUTHENTICATED;
    static GUEST            = GUEST;

    /**
     * Creates a new `Session` data store.
     */
    constructor() {
        this.props = {
            session : "",
            user : null,
            events : new Events(),
            mode : GUEST,
        };
        this.funcs = {
            /**
             * `update` is called when either `session` or `user` changes and determines if we've switched
             * modes.
             */
            update : () => {
                const mode = this.props.session !== "" && this.props.user !== null;
                if( mode !== this.props.mode ) {
                    this.props.mode = mode;
                    this.props.events.trigger( EVENT_SESSION_MODE, mode );
                }
            },
        }
    }

    /**
     * `destroy` frees resources in the `Session` and ensures it will no longer notify subscribers of changes.
     */
    destroy = () => {
        this.props.events.destroy();
        //
        delete this.props;
        //
        destroy( this, MODULE_NAME, "Session" );
    }

    /**
     * `register` registers a listener for when the session switches modes.
     * 
     * @param {func} cb Callback function with signature: `( mode ) => {}` where `mode` is one of `Session.AUTHENTICATED` or `Session.GUEST`.
     * @returns {func} An unregister function.
     */
    register = ( cb ) => {
        return this.props.events.register( EVENT_SESSION_MODE, cb );
    }

    /**
     * Returns the current `mode`.
     * 
     * @type {boolean}
     */
    get mode() {
        return this.props.mode;
    }

    /**
     * The current `session` value.  An empty string while in GUEST and a non-empty string when AUTHENTICATED.
     * 
     * @type {string}
     */
    get session() {
        return this.props.session;
    }

    /**
     * The current `user` value.  `null` while in GUEST and non-null when AUTHENTICATED.
     * 
     * @type {Object}
     */
    get user() {
        return this.props.user;
    }

    set session( value ) {
        if( value !== this.props.session ) {
            this.props.session = value;
            this.funcs.update();
        }
    }

    set user( value ) {
        if( value !== this.props.user ) {
            this.props.user = value;
            this.funcs.update();
        }
    }
}

export default Session;