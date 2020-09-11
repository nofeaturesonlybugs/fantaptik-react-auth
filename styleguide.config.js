const path = require( 'path' );

module.exports = {
    skipComponentsWithoutExample : true,
    
    require : [
        path.join( __dirname, 'node_modules/materialize-css/dist/css/materialize.min.css' ),
        path.join( __dirname, 'styleguide.globals.js' ),
    ],

    ignore : [
        '**/components/**/common.js',
    ],

    //
    // STYLES
    styles : './styleguide.styles.js',
};