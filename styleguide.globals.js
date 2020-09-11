// Makes all controls available in styleguidist examples without explicit imports.

import Authenticated from './src/components/Authenticated';
import Guest from './src/components/Guest';
import LoginForm from './src/components/LoginForm';

global.Authenticated = Authenticated;
global.Guest = Guest;
global.LoginForm = LoginForm;
