import { MODULE_NAME, ReduxKey } from './consts';

/**
 * `Actions` provides factory methods for creating the actions to dispatch to the Redux store.
 * 
 * The `Types` member can be used to create your own reducer aware of `@fantaptik/react-auth` actions.  
 * 
 * **Important**  You only need to use an instance of `Actions` when creating your own reducer aware
 * of the actions dispatched by this package.  In that case you should not instantiate `Actions` yourself --
 * instead perform one of the following:  
 *  1. Use the globally exported `Actions` instance; if you did not instantiate any `Gob` instances this is probably
 * what you want:
 *  > ```js
 *  > import { Actions } from '@fantaptik/react-auth';
 *  > console.log( Actions.Types );
 *  > // Create your own reducer here and switch off of `Actions.Types`
 *  > ```  
 *  2. Create an instance of `Gob` and use the `Actions` property:
 *  > ```js
 *  > import { Gob } from '@fantaptik/react-auth';
 *  > const slice = new Gob( 'slice-name' );
 *  > console.log( slice.Actions.Types );
 *  > // Create your own reducer here and switch off of `slice.Actions.Types`
 *  > // NB: Your reducer should also check that `slice.Actions.matches( action ) === true`
 *  > ```  
 *  > See the **Understanding Gobs** tutorial for extended information.  
 */
class Actions {
    /**
     * 
     * @param {string} id Unique identifier shared by a `Gob`.
     */
    constructor( id ) {
        //
        // Privatize properties.
        this.props = {
            id,
            redux : {
                [ReduxKey] : {
                    id,
                }
            },
            types : {
                Close               : MODULE_NAME + '/close',
                Open                : MODULE_NAME + '/open',
                Reject              : MODULE_NAME + '/reject',
                ResumeBegin         : MODULE_NAME + '/resume/begin',
                ResumeEnd           : MODULE_NAME + '/resume/end',
            },
        };
    }

    /**
     * `matches` accepts an `action` object and returns `true` if it matches the action generators from this
     * instance.  
     * 
     * **Note** `action.type` is not checked as it is assumed the reducer will be checking that property.  
     * 
     * @method
     * @param {Object} action The Redux action.
     * @returns {boolean}
     */
    matches = ( action ) => {
        return action[ ReduxKey ] && action[ ReduxKey ].id === this.props.id;
    }

    /**
     * `Types` returns the `action.type` strings that this instance dispatches to the Redux store.
     * 
     * @readonly
     * @type {Object}
     * @property {string} Close
     * @property {string} Open
     * @property {string} Reject
     * @property {string} ResumeBegin
     * @property {string} ResumeEnd
     */
    get Types() {
        return this.props.types;
    }

    /**
     * Creates the *Close* reducer action.  
     * 
     * This action sets the reducer to *guest*.
     * 
     * @method
     * @returns {Object}
     */
    Close = () => {
        return {
            ...this.props.redux,
            type : this.Types.Close,
        };
    }

    /**
     * Creates the *Open* reducer action.
     * 
     * This action sets the reducer to *authenticated*; all `SocketPlugin` instances will attempt to `connect()`
     * to the server.
     * 
     * @method
     * @param {string} session The `session-id` value.
     * @param {Object} user The opaque `user` object received when authenticating with the server.
     * @param {string} username The `username` that was used to authenticate.
     * @returns {Object}
     */
    Open = ( session, user, username ) => {
        return {
            ...this.props.redux,
            type : this.Types.Open,
            session,
            user,
            username,
        };
    }

    /**
     * Creates the `Reject` reducer action.
     * 
     * This action indicates a `SocketPlugin` attempted to verify itself with the server and was rejected.  Sets
     * the reducer to *guest*.
     * 
     * @method
     * @returns {Object}
     */
    Reject = () => {
        return {
            ...this.props.redux,
            type : this.Types.Reject,
        };
    }
    
    /**
     * Creates the `ResumeBegin` reducer action.
     * 
     * This action is dispatched prior to an HTTP-POST session resume attempt.
     * 
     * @method
     * @returns {Object}
     */
    ResumeBegin = () => {
        return {
            ...this.props.redux,
            type : this.Types.ResumeBegin,
        };
    }

    /**
     * Creates the `ResumeEnd` reducer action.
     * 
     * This action is dispatched after an HTTP-POST session resume attempt has completed.
     * 
     * @method
     * @returns {Object}
     */
    ResumeEnd = () => {
        return {
            ...this.props.redux,
            type : this.Types.ResumeEnd,
        };
    }

}

export default Actions;