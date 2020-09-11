import React from 'react';
import PropTypes from 'prop-types';

const Guest = ( { children, dispatch, gob, session, user } ) => {
    React.useEffect( () => {
        if( gob && dispatch ) {
            gob.dispatcher = dispatch;
        }
    }, [] );
    return session === "" && user === null ? children : null;
}

Guest.propTypes = {
    /** The store dispatch function. */
    dispatch : PropTypes.func,

    /** The `Gob` instance we're tied to. */
    gob : PropTypes.object,

    /** A `session` string received during authentication. */
    session : PropTypes.string,

    /** A `user` object when authenticated; false otherwise. */
    user : PropTypes.object,
}

export default Guest;