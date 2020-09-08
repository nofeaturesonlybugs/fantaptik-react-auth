import { MODULE_NAME } from './consts';

/**
 * @name ServerApi.Types
 * @type {Object}
 * @property {string} Authenticate The `type` string for *Authenticate* message.
 * @property {string} Close The `type` string for *Close* message.
 * @property {string} Resume The `type` string for *Resume* message.
 * @property {string} SocketResume The `type` string for *SocketResume* message.
 */
const ServerTypes = {
    Authenticate : MODULE_NAME + "/authenticate",
    Resume : MODULE_NAME + "/resume",
    Close : MODULE_NAME + "/close",
    SocketResume : MODULE_NAME + "/socket/resume",
}

/**
 * @typedef ServerAuthenticateResponse
 * 
 * `session` and `user` are used together by `SocketPlugin` to verify connections with the server.
 * 
 * @type {Object}
 * @property {boolean} success `true` if authenticated; `false` otherwise.
 * @property {string} session The `session-id` recognized by the server.
 * @property {Object} user A non-null object usable by the application; it is opaque to this package.
 */

/**
 * @typedef ServerResultResponse
 * 
 * @type {Object}
 * @property {boolean} success `true` if the action succeeded; `false` otherwise.
 */

/**
 * ServerApi provides factory methods to create the data objects sent to the server.  
 * 
 * See the **Server API** tutorial more information.  
 * 
 * @namespace ServerApi
 */
const ServerApi = {
    //
    // HTTP-POST API
    //

    /**
     * Creates the *Authenticate* object.
     * 
     * @param {string} username
     * @param {string} password
     */
    Authenticate : ( username, password ) => {
        return {
            type : ServerTypes.Authenticate,
            username,
            password,
        };
    },

    /**
     * Creates the *Resume* object.
     */
    Resume : () => {
        return {
            type : ServerTypes.Resume,
        };
    },

    //
    // SOCKET API
    //

    /**
     * Creates the *Close* object.
     * 
     * @param {string} session
     * @param {Object} user
     */
    Close : ( session, user ) => {
        return {
            type : ServerTypes.Close,
            session,
            user,
        };
    },

    /**
     * Creates the *SocketResume* object.
     * 
     * @param {string} session
     * @param {Object} user
     */
    SocketResume : ( session, user ) => {
        return {
            type : ServerTypes.SocketResume,
            session,
            user,
        };
    },
}

ServerApi.Types = ServerTypes;

export default ServerApi;