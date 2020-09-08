This document outlines the contract between `@fantaptik/react-auth` and the *server*.

### HTTP-POST  

*Authorization*  
> Attempts to open an authenticated session with the server.  
>> ```js
>> {
>>    type          : "fantaptik/react-auth/authenticate",
>>    username      : "username",
>>    password      : "password",
>> }
>> ```  
>> Response  
>>> `session` and `user` are used by `SocketPlugin` to verify authentication during the `onconnect()` handler.  
>>> See {@link ServerAuthenticateResponse}.
>>> ```js
>>> {
>>>     // true if authenticated; false otherwise
>>>     success     : false,
>>>     // Unique session identifier.
>>>     session     : "",
>>>     // A non-null user object opaque to this package.
>>>     user        : {},
>>> }
>>> ```  

*Session Resume*  
> Attempts to resume an authenticated session with the server; server can use data from a cookie to validate.  
>> ```js
>> {
>>    type          : "fantaptik/react-auth/resume",
>> }
>> ```  
>> Response  
>>> Same as *Authorization*; see above or {@link ServerAuthenticateResponse}.  

### SOCKET

*Socket Resume*  
> When the Redux store becomes *authenticated* the socket will connect and send this message to verify itself with the server.  If this step fails the socket is stopped and the store returns to *guest*.  
>>> `session` and `user` are the values received during `Authorization` or `Session Resume`.  
>>> ```js
>>> {
>>>    type          : "fantaptik/react-auth/socket/resume",
>>>    session       : "",
>>>    user          : {},
>>> }
>>> ```   
>> Response  
>>> See {@link ServerResultResponse}.  
>>> ```js
>>> {
>>>     // true if successful; false otherwise
>>>     success     : false,
>>> }
>>> ```  

*Session End*  
> When `SocketPlugin`.`logout()` is called this message is sent to the server.  If the server responds with a
successful message the Redux store is returned to *guest*.  
>>> `session` and `user` are the values received during `Authorization` or `Session Resume`.  
>>> ```js
>>> {
>>>    type          : "fantaptik/react-auth/close",
>>>    session       : "",
>>>    user          : {},
>>> }
>>> ```   
>> Response  
>>> See {@link ServerResultResponse}.  
>>> ```js
>>> {
>>>     // true if successful; false otherwise
>>>     success     : false,
>>> }
>>> ```  

*Notify Session End*  
> The server can send this message to notify `SocketPlugin` that the session is over and the store should return to *guest*.  
>>> ```js
>>> {
>>>    type          : "fantaptik/react-auth/close",
>>> }
>>> ```