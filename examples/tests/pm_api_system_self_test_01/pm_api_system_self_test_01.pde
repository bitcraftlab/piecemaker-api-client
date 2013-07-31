/** 
 *    Motion Bank research, http://motionbank.org/
 *
 *    Piecemaker 2 API test: 
 *    create, update and delete some groups ...
 *
 *    Processing 2.0
 *    created: fjenett 20130302
 */
 
import java.util.*;

import org.piecemaker2.api.*;
import org.piecemaker2.models.*;

PieceMakerApi api;

void setup ()
{
    size( 200, 200 );
    
    api = new PieceMakerApi( this, "http://localhost:9292" );

    api.login( "super-admin@example.com", "super-admin", api.createCallback( "loggedIn" ) );
}

void loggedIn ( String api_key )
{    
    api.whoAmI( api.createCallback( "selfLoaded" ) );
}

void draw ()
{
}

void selfLoaded ( User u )
{
    println( "You are: " + u.email );
    
    api.getSystemTime( api.createCallback( "systemTimeReceived" ) );
}

void systemTimeReceived ( long time )
{
    println( "System time: " + time );
}

void piecemakerError ( int status, String errMsg, String request )
{
    println( "Failed: " + status + " " + errMsg + " at " + request );
}