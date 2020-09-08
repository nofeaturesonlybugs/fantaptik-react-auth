/**
 * Defines the module name.
 * 
 * @ignore
 * @const
 * @type {string}
 */
export const MODULE_NAME = 'fantaptik/react-auth';

/**
 * `Local` contains item names for local storage.
 * 
 * @ignore
 * @type {Object|null}
 * @property {string} Login The storage name for `Login` storage item.
 */
export const Local = window && window.localStorage ? {
    Login : "login",
} : null;

/**
 * `ReduxKey` is the index into Redux actions used by this package.
 * 
 * @ignore
 * @type {Object}
 */
export const ReduxKey = {};
