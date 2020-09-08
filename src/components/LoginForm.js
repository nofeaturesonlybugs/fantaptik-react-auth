import React from 'react';
import PropTypes from 'prop-types';

import { Button, Card, Grid, Icon, Text } from '@fantaptik/material';

import { Local } from '../consts';
import ServerApi from '../Server';

import post from '../http/post';

// TODO Document
const Icons = {
    Login : "camera",
};

// TODO props.rejected===true should have a special message: "An existing session was rejected; please login again."
const LoginForm = ( { dispatch, gob, resuming, username : usernameProp="", password: passwordProp="", session, uriLogin, uriResume, user } ) => {
    const [ username, updateUsername ] = React.useState( usernameProp );
    const [ password, updatePassword ] = React.useState( passwordProp );
    //
    // Post handlers.
    const postHandlers = {
        //
        // This handler is common between login and resume.
        response : ( { data } ) => {
            const { success, session, user } = data;
            if( success ) {
                dispatch && dispatch( gob.Actions.Open( session, user, username ) );
            }
            return data;
        },
        //
        // This handler is only for login action.
        login : ( { success, session, user } ) => {
            if( success && Local ) {
                // NB: Also set the `username` in storage otherwise other tabs won't know what it is
                // and when those tabs return to guest the LoginForm won't have a username value preset.
                gob.storage.set( Local.Login, { session, user, username } );
                gob.storage.remove( Local.Login );
            }
        },
    };
    //
    // Event handlers.
    const handlers = {
        login : () => {
            post.login( uriLogin, ServerApi.Authenticate( username, password ) )
                .then( postHandlers.response )
                .then( postHandlers.login );
        },
        username : username => updateUsername( username ),
        password : password => updatePassword( password ),
    };
    React.useEffect( () => {
        // Register local storage handler; this browser tab can then tell others to authenticate.
        return gob.storage.registerItem( Local.Login, event => {
            if( event.created || event.modified ) {
                const { session, user, username } = event.newValue;
                dispatch && dispatch( gob.Actions.Open( session, user, username ) );
            }
        } );
    }, [] );
    if( uriResume ) {
        React.useEffect( () => {
            // Try and resume the last session via cookie or other mechanism.
            //
            // Update store that we are attempting to resume.
            dispatch && dispatch( gob.Actions.ResumeBegin() );
            //
            // Attempt to resume via HTTP-POST.
            post.resume( uriResume, ServerApi.Resume() )
                .then( postHandlers.response )
                .finally( () => {
                    //
                    // Success or fail we are not resuming anymore; update the store.
                    dispatch && dispatch( gob.Actions.ResumeEnd() );
                } );
        }, [] );
    }

    return (
        <Card show={session === "" && user === null && resuming !== true} className="login-form">
            <Card.Title>Login</Card.Title>
            <Grid auto={[12,6]}>
                <Text id={"username-" + gob.id} label="Username" required value={username} onChange={handlers.username} />
                <Text.Password id={"password-" + gob.id} label="Password" type="password" required value={password} onChange={handlers.password} />
            </Grid>
            <Card.Actions className="center-align">
                <Button onClick={handlers.login}>
                    <Icon>{Icons.Login}</Icon>
                    Login
                </Button>
            </Card.Actions>
        </Card>
    );
}

LoginForm.propTypes = {
    /** The store dispatch function. */
    dispatch : PropTypes.func,

    /** The `Gob` instance we're tied to. */
    gob : PropTypes.object,

    /** Sets the password */
    password : PropTypes.string,

    /** true when an existing session was rejected */
    rejected : PropTypes.bool,

    /** true when session is resuming via HTTP-POST */
    resuming : PropTypes.bool,

    /** Sets the URI for login for HTTP-POST */
    uriLogin : PropTypes.string.isRequired,

    /** Sets the URI for resume-from-cookie for HTTP-POST.  When not set the resume attempt is not made. */
    uriResume : PropTypes.string,

    /** Sets the username */
    username : PropTypes.string,

    /** A `session` string received during authentication. */
    session : PropTypes.string,

    /** The user object from the store. */
    user : PropTypes.object,
}

export default LoginForm;