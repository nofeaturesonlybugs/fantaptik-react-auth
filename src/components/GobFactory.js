import React from 'react';
import { connect } from 'react-redux';

import Authenticated from './Authenticated';
import Guest from './Guest';
import LoginForm from './LoginForm';

/**
 * `Gob` attaches a React component to a specific `Gob`.
 * 
 * @ignore
 * @function
 * @param {Gob} gob The `Gob` instance to attach `Component` to.
 * @param {Component} Component The React component to attach to the `Gob` instance.
 */
export const Gob = ( gob, Component ) => connect( gob.storeToProps )( 
    ( props => {
        return (
            <Component {...props} gob={gob} />
        );
    } )
);

/**
 * @typedef {Object} Components
 * @property {Component} Authenticated `Authenticated` component.
 * @property {Component} LoginForm `LoginForm` component.
 * @property {Component} Guest `Guest` component.
 */

/**
 * GobFactory creates a set of components for the given `Gob`.
 * 
 * @ignore
 * @function
 * @param {Gob} gob The `Gob` instance the components are attached to.
 * @returns {Components}
 */
const GobFactory = gob => {
    return {
        Authenticated : Gob( gob, Authenticated ),
        LoginForm : Gob( gob, LoginForm ),
        Guest : Gob( gob, Guest ),
    }
}

export default GobFactory;