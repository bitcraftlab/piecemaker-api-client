// Piecemaker 2 API client for Processing and plain Java, JS in the browser and node.js
// ====================================================================================

// This is the JavaScript version

//  Created by fjenett 2012, 2013  
//  https://github.com/motionbank/piecemaker-api-client

//  See:  
//	http://motionbank.org/  
//	http://piecemaker.org/

//	Version: ##version##  
//	Build: ##build##

(function(){

	var PieceMakerApi = (function(ajaxImpl){

		// Helpers
		// -------

		// ... just an empty function to use in place of missing callbacks

	    var noop = function(){};

	    // Convert Processing.js HashMaps to JavaScript objects

	    var convertData = function ( data ) {
	    	if ( !data ) return data;
	    	if ( typeof data !== 'object' ) return data;
	    	if ( 'entrySet' in data && typeof data.entrySet === 'function' ) {
	    		var allowed_long_keys = ['utc_timestamp', 'duration', 'type'];
	    		var set = data.entrySet();
	    		if ( !set ) return data;
	    		var obj = {};
	    		var iter = set.iterator();
	    		while ( iter.hasNext() ) {
					var entry = iter.next();
					var val = entry.getValue();
					if ( val && typeof val === 'object' && 
						 'entrySet' in val && 
						 typeof val.entrySet === 'function' ) val = convertData(val);
					var key = entry.getKey();
					if ( !key ) {
						throw( "Field key is not valid: " + key );
					}
					obj[entry.getKey()] = val;
				}
				return obj;
	    	} else {
	    		if ( 'utc_timestamp' in data ) data.utc_timestamp = jsDateToTs(data.utc_timestamp);
	    		if ( 'created_at' in data )    data.created_at 	  = jsDateToTs(data.created_at);
	    	}
	    	return data;
	    }

	    // temporary fix for:
	    // https://github.com/motionbank/piecemaker2/issues/54

	    var fixEventsResponseToArr = function ( resp ) {
	    	if ( resp instanceof Array ) {
	    		var arr = [];
	    		for ( var i = 0; i < resp.length; i++ ) {
	    			arr.push( expandEventToObject( fixEventResponse( resp[i] ) ) );
	    		}
	    		return arr;
	    	}
	    	return resp;
	    }

	    var fixEventResponse = function ( resp ) {
	    	var eventObj = resp['event'];
	    	eventObj['fields'] = {};
	    	for ( var i = 0, fields = resp['fields']; i < fields.length; i++ ) {
	    		eventObj['fields'][fields[i]['id']] = fields[i]['value'];
	    	}
	    	return eventObj;
	    }

	    var expandEventToObject = function ( event ) {
	    	event.fields.get = (function(e){
	    		return function ( k ) {
	    			return e.fields[k];
	    		}
	    	})(event);
	    	event.utc_timestamp = new Date( event.utc_timestamp * 1000.0 );
	    	return event;
	    }

	    var jsDateToTs = function ( date_time ) {
	    	if ( date_time instanceof Date ) {
	    		return date_time.getTime() / 1000.0;
	    	} else {
	    		if ( date_time > 9999999999 ) {
	    			return date_time / 1000.0; // assume it's a JS timestamp in ms
	    		} else {
	    			return date_time; // assume it's ok
	    		}
	    	}
	    }

	    // XHR requests
	    // ------------

		/* cross origin resource sharing
		   http://www.html5rocks.com/en/tutorials/cors/ */
		
	    var xhrRequest = function ( pm, url, type, data, success ) {

	    	// Almost all calls to the API need to be done including a per-user API token.
	    	// This token is passed into the constructor below and gets automatically 
	    	// added to each call here if it is not already present.

	    	if ( !pm.api_key && !url.match(/\/user\/login$/) ) {
	    		throw( "PieceMakerApi: need an API_KEY, please login first to obtain one" );
	    	}

	    	var ts = (new Date()).getTime();
	    	var callUrl = url + '.json';

	        ajaxImpl({
	                url: callUrl,
	                type: type,
	                dataType: 'json',
	                data: data || {},
					// before: function ( xhr ) {
					// 	if ( !url.match(/\/user\/login$/) ) {
					// 		xhr.setRequestHeader( 'X-Access-Key', api.api_key );
					// 	}
					// },
					context: pm,
	                success: function () {
	                	if ( arguments && arguments[0] && 
	                		 typeof arguments[0] === 'object' && 
	                		 !(arguments[0] instanceof Array) && 
	                		 !('queryTime' in arguments[0]) ) {
	                		arguments[0]['queryTime'] = ((new Date()).getTime()) - ts;
	                	}
	                	success.apply( pm, arguments );
	                },
	                error: function (err) {
	                    xhrError( pm, callUrl, type, err );
	                },
	                /* , xhrFields: { withCredentials: true } */
					/* , headers: { 'Cookie' : document.cookie } */
					headers: {
						'X-Access-Key': pm.api_key
					}
	            });
	    };

		var xhrGet = function ( pm, opts ) {
			xhrRequest( pm, opts.url, 'get', opts.data, opts.success );
		}

		var xhrPut = function ( pm, opts ) {
		    xhrRequest( pm, opts.url, 'put', opts.data, opts.success );
		}

		var xhrPost = function ( pm, opts ) {
		    xhrRequest( pm, opts.url, 'post', opts.data, opts.success );
		}

		var xhrDelete = function ( pm, opts ) {
		    xhrRequest( pm, opts.url, 'delete', null, opts.success );
		}
		
		var xhrError = function ( pm, url, type, err ) {

			var statusCode = -1, statusMessage = "";

			if ( err ) {
				statusCode = err.status || err.statusCode;
				statusMessage = err.statusText || err.message || 'No error message';
				if ( err.responseText ) {
					statusMessage += " " + err.responseText;
				}
			}

			if ( pm && 'piecemakerError' in pm && typeof pm['piecemakerError'] == 'function' )
				pm['piecemakerError']( statusCode, statusMessage, type.toUpperCase() + " " + url );
			else {
				if ( typeof console !== 'undefined' && console.log ) {
					console.log( statusCode, statusMessage, url, type, err );
				}
				throw( err );
			}
		}

	    // Class PieceMakerApi2
	    // ---------------------

	    // The actual implementation of the client class starts here

	    // ###PieceMakerApi( context, host [, api_key] )
	    // or
	    // ###PieceMakerApi( options )

	    // Expects these arguments or an options object with:
	    // ```
	    // {  
	    //   context: <object>,
	    //   host: <string>,
	    //	 api_key: <string> // optional
	    // }
	    // ```
	    //
	    // If the api_key is not present you must use login() before being
	    // able to issue and calls to the API. 

	    var _PieceMakerApi = function ( argContext, argHost, argApiKey ) {

	    	// Fields

			this.host 	 = undefined;
	    	this.api_key = undefined;
	    	this.context = undefined;

	    	// Parsing the parameters

			var params = arguments[0];
			
			if ( arguments.length === 1 && typeof params == 'object' ) {
		        this.context 	= params.context || {};
				this.api_key	= params.api_key || false;
				this.host 		= params.host || params.base_url || 'http://localhost:3000';
			} else {
				if ( argContext && typeof argContext == 'object' ) {
					this.context = argContext;
				}
				if ( argHost && typeof argHost == 'string' ) {
					this.host = argHost;
				}
				if ( argApiKey && typeof argApiKey == 'string' ) {
					this.api_key = argApiKey;
				}
			}

			this.host += '/api/v1';

			// Since piecemaker 2 we require the API key to be added

			//if ( !this.api_key ) throw( "PieceMaker2API: need an API_KEY for this to work" );
		}

		/* just as a personal reference: discussing the routes
		   https://github.com/motionbank/piecemaker2/issues/17 */

		// Users
		// ------

		// ###Log a user in

		// Returns api key as string

		_PieceMakerApi.prototype.login = function ( userEmail, userPassword, cb ) {
			var callback = cb || noop, api = this;
			if ( !userEmail || !userPassword ) {
				throw( "PieceMakerApi: need name and password to log user in" );
			}
			var self = this;
		    xhrPost( this, {
		        url: self.host + '/user/login',
		        data: {
		        	email: userEmail,
		        	password: userPassword
		        },
		        success: function ( response ) {
		        	var api_key_new = null;
		        	if ( response && 'api_access_key' in response && response['api_access_key'] ) {
		        		self.api_key = response['api_access_key'];
		        		api_key_new = self.api_key;
		        	}
					callback.call( self.context || cb, api_key_new );
		        }
		    });
		}

		// ###Log a user out

		_PieceMakerApi.prototype.logout = function ( cb ) {
			var callback = cb || noop, api = this;
			var self = this;
		    xhrPost( this, {
		        url: self.host + '/user/logout',
		        success: function ( response ) {
		        	if ( response && 'api_access_key' in response && response['api_access_key'] ) {
		        		self.api_key = response['api_access_key'];
		        	}
					callback.call( self.context || cb, null );
		        }
		    });
		}

		// ###Get all users

		// Returns a list of all users

		_PieceMakerApi.prototype.listUsers = function ( cb ) {
			var callback = cb || noop, api = this;
			var self = this;
		    xhrGet( this, {
		        url: self.host + '/users',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Get self

		// Returns the user object for the user to given API key

		_PieceMakerApi.prototype.whoAmI = function ( cb ) {
			var callback = cb || noop, api = this;
			var self = this;
		    xhrGet( this, {
		        url: self.host + '/user/me',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Create a user

		// Creates a new user and returns it

		_PieceMakerApi.prototype.createUser = function ( userName, userEmail, userIsAdmin, cb ) {
			var callback = cb || noop, api = this;
			var self = this;
			xhrPost( self, {
				url: self.host + '/user',
				data: {
					name: userName, email: userEmail,
					is_super_admin: userIsAdmin
				},
				success: function ( response ) {
					callback.call( self.context || cb, response );
				}
			});
		}

		// ###Get one user

		// Get a user based on ID

		_PieceMakerApi.prototype.getUser = function ( userId, cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/user/' + userId,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Update one user

		// Update a user and return it

		_PieceMakerApi.prototype.updateUser = function ( userId, userName, userEmail, userPassword, userToken, cb ) {
			var callback = cb || noop;
			var self = this;
			xhrPut( self, {
				url: self.host + '/user/' + userId,
				data: {
					name: userName, email: userEmail,
					password: userPassword, api_access_key: userToken
				},
				success: function ( response ) {
					callback.call( self.context || cb, response );
				}
			}); 
		}

		// ###Delete one user

		// Delete a user

		_PieceMakerApi.prototype.deleteUser = function ( userId, cb ) {
			var callback = cb || noop, self = this;
			xhrDelete( this, {
				url: self.host + '/user/' + userId,
				success: function ( response ) {
					callback.call( self.context || cb /*, response*/ );
				}
			});
		}

		// Groups
		// -------

		// Groups are what Piecemaker 1 called "Piece":  
		// they are just a collection of events

		// ###Get all groups for current user

		// Get a list of all available (to current user) groups

		_PieceMakerApi.prototype.listGroups = function ( cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/groups',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Get all groups

		// Get a list of all available groups,
		// **super_admin only**

		_PieceMakerApi.prototype.listAllGroups = function ( cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/groups/all',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Create a group

		// Arguments:  
		// ```title``` is the name of the group  
		// ```text``` is the group description  
		// [ ```callback``` an optional callback ]  

		// Returns:
		// A fully loaded group object

		_PieceMakerApi.prototype.createGroup = function ( groupTitle, groupText, cb ) {
			var callback = cb || noop;
			var self = this;
			if ( !groupTitle ) {
				throw( "createGroup(): title can not be empty" );
			}
			xhrPost( self, {
				url: self.host + '/group',
				data: {
					title: groupTitle,
					text: groupText || ''
				},
			    success: function ( response ) {
					callback.call( self.context || cb, response );
			    }
			});
		}

		// ###Get a group

		// Returns:  
		// A fully loaded group object

		_PieceMakerApi.prototype.getGroup = function ( groupId, cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/group/'+groupId,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Update a group

		// Returns:  
		// A fully group object

		_PieceMakerApi.prototype.updateGroup = function ( groupId, groupData, cb ) {
			var data = convertData( groupData );
			var callback = cb || noop;
			var self = this;
			xhrPut( self, {
				url: self.host + '/group/'+groupId,
				data: data,
				success: function ( response ) {
					callback.call( self.context || cb, response );
				}
			});
		}

		// ###Delete a group

		// Returns nothing

		_PieceMakerApi.prototype.deleteGroup = function ( groupId, cb ) {
			var callback = cb || noop, self = this;
			xhrDelete( this, {
					url: self.host + '/group/'+groupId,
					success: function ( response ) {
					callback.call( self.context || cb /*, response*/ );
				}
			});
		}

		// ###Get all users in this group

		// Returns:
		// A list of all users in that group

		_PieceMakerApi.prototype.listGroupUsers = function ( groupId, cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/group/'+groupId+'/users',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Add a user to a group

		// Expects a user role id to be given as which the user will act in group

		// Returns: TODO

		_PieceMakerApi.prototype.listGroupUsers = function ( groupId, userId, userRoleId, cb ) {
			var callback = cb || noop, self = this;
		    xhrPost( this, {
		        url: self.host + '/group/'+groupId+'/user/'+userId,
		        data : {
		        	user_role_id : userRoleId
		        },
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Update user role in a group

		// Returns: TODO

		_PieceMakerApi.prototype.listGroupUsers = function ( groupId, userId, userRoleId, cb ) {
			var callback = cb || noop, self = this;
		    xhrPut( this, {
		        url: self.host + '/group/'+groupId+'/user/'+userId,
		        data : {
		        	user_role_id : userRoleId
		        },
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Remove user from group

		_PieceMakerApi.prototype.listGroupUsers = function ( groupId, userId, cb ) {
			var callback = cb || noop, self = this;
		    xhrDelete( this, {
		        url: self.host + '/group/'+groupId+'/user/'+userId,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// Roles
		// -------

		// A role is a predefined set of permissions. Each user has a global role and 
		// roles per group that he/she is part of.

		// ###List all available roles

		_PieceMakerApi.prototype.listRoles = function ( cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/roles',
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Add new role

		// Returns: role created

		_PieceMakerApi.prototype.createRole = function ( roleId, optionalInheritRoleId, optionalText, cb ) {
			if ( arguments.length === 2 ) {
				cb = optionalInheritRoleId;
				optionalInheritRoleId = undefined;
			} else if ( arguments.length === 3 ) {
				cb = optionalText;
				optionalText = undefined;
			}
			
			var data = { id: roleId };
			if ( optionalInheritRoleId ) data.inherit_from_id = optionalInheritRoleId;
			if ( optionalText ) data.text = optionalText;

			var callback = cb || noop, self = this;
		    xhrPost( this, {
		        url: self.host + '/role',
		        data : data,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Update role

		// Returns: role updated

		_PieceMakerApi.prototype.updateRole = function ( roleId, optionalInheritRoleId, optionalText, cb ) {
			if ( arguments.length === 2 ) {
				cb = optionalInheritRoleId;
				optionalInheritRoleId = undefined;
			} else if ( arguments.length === 3 ) {
				cb = optionalText;
				optionalText = undefined;
			}
			
			var data = {};
			if ( optionalInheritRoleId ) data.inherit_from_id = optionalInheritRoleId;
			if ( optionalText ) data.text = optionalText;

			var callback = cb || noop, self = this;
		    xhrPut( this, {
		        url: self.host + '/role/' + roleId,
		        data : data,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Delete a role

		_PieceMakerApi.prototype.deleteRole = function ( roleId, cb ) {
			var callback = cb || noop, self = this;
		    xhrDelete( this, {
		        url: self.host + '/role/' + roleId,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// ###Get a role

		_PieceMakerApi.prototype.getRole = function ( roleId, cb ) {
			var callback = cb || noop, self = this;
		    xhrGet( this, {
		        url: self.host + '/role/' + roleId,
		        success: function ( response ) {
					callback.call( self.context || cb, response );
		        }
		    });
		}

		// Role permissions
		// --------

		// A permission reflects a certain action in the API. 
		// These can be grouped into roles to allow for fine grained user rights control.

		// ###Get all permissions
		
		_PieceMakerApi.prototype.listPermissions = function ( cb ) {
			var callback = cb || noop, self = this;
			xhrGet( this, {
		        url: self.host + '/permissions',
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Add a permission to a role

		// Returns: TODO
		
		_PieceMakerApi.prototype.addPermissionToRole = function ( roleId, permission, right, cb ) {
			var callback = cb || noop, self = this;
			xhrPost( this, {
		        url: self.host + 'role/' + roleId + '/permission',
		        data : {
		        	entity : permission,
		        	permission : right
		        },
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Update a role permission

		// Returns: TODO
		
		_PieceMakerApi.prototype.updatePermissionForRole = function ( roleId, permission, right, cb ) {
			var callback = cb || noop, self = this;
			xhrPut( this, {
		        url: self.host + 'role/' + roleId + '/permission/' + permission,
		        data : {
		        	permission : right
		        },
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Remove a permission from a role
		
		_PieceMakerApi.prototype.removePermissionFromRole = function ( roleId, permission, cb ) {
			var callback = cb || noop, self = this;
			xhrDelete( this, {
		        url: self.host + 'role/' + roleId + '/permission/' + permission,
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get a role permission

		// Returns: the role permission
		
		_PieceMakerApi.prototype.getPermissionForRole = function ( roleId, permission, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( this, {
		        url: self.host + 'role/' + roleId + '/permission/' + permission,
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// Events
		// --------

		// Events can be anything relating to time and a group
		
		// ###Get all events
		
		_PieceMakerApi.prototype.listEvents = function ( groupId, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( this, {
		        url: self.host + '/group/'+groupId+'/events',
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get all events of a certain type
		
		_PieceMakerApi.prototype.listEventsOfType = function ( groupId, type, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( this, {
		        url: self.host + '/group/'+groupId+'/events',
		        data: {
		        	type: type
		        },
		        success: function ( response ) {
					callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get all events that have certain fields (id and value must match)
		
		_PieceMakerApi.prototype.listEventsWithFields = function ( /* groupId, id1, val1, id2, val2, …, cb */ ) {
			var groupId = arguments[0];
			var fields = {};
			if ( arguments.length > 3 ) {
				for ( var i = 1; i < arguments.length-1; i+=2 ) {
					fields[arguments[i]] = arguments[i+1];
				}
			} else if ( typeof arguments[1] === 'object' ) {
				for ( var k in arguments[1] ) {
					if ( arguments[1].hasOwnProperty(k) ) fields[k] = arguments[1][k];
				}
			} else {
				throw( 'Wrong parameter count' );
			}
			var cb = arguments[arguments.length-1];
			var callback = cb || noop, self = this;
			xhrGet( self, {
		        url: self.host + '/group/'+groupId+'/events',
		        data: {
		        	fields: fields
		        },
		        success: function ( response ) {
		        	callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get all events that happened within given timeframe
		
		_PieceMakerApi.prototype.listEventsBetween = function ( groupId, from, to, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( self, {
		        url: self.host + '/group/'+groupId+'/events',
		        data: {
		        	from: jsDateToTs(from),
		        	to:   jsDateToTs(to)
		        },
		        success: function ( response ) {
		        	callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get all events that match
		
		_PieceMakerApi.prototype.findEvents = function ( groupId, eventData, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( self, {
		        url: self.host + '/group/'+groupId+'/events',
		        data: eventData,
		        success: function ( response ) {
		        	callback.call( self.context || cb, fixEventsResponseToArr( response ) );
		        }
		    });
		}

		// ###Get one event
		
		_PieceMakerApi.prototype.getEvent = function ( groupId, eventId, cb ) {
			var callback = cb || noop, self = this;
			xhrGet( self, {
		        url: self.host + '/event/'+eventId,
		        success: function ( response ) {
		        	callback.call( self.context || cb, expandEventToObject( fixEventResponse( response ) ) );
		        }
		    });
		}

		// ###Create one event

		_PieceMakerApi.prototype.createEvent = function ( groupId, eventData, cb ) {
			var data = convertData( eventData );
			var callback = cb || noop, self = this;
			xhrPost( this, {
		        url: self.host + '/group/'+groupId+'/event',
		        data: data,
		        success: function ( response ) {
		        	callback.call( self.context || cb, expandEventToObject( fixEventResponse( response ) ) );
		        }
		    });
		}

		// ###Update one event

		_PieceMakerApi.prototype.updateEvent = function ( groupId, eventId, eventData, cb ) {
			var data = convertData( eventData );
			data['event_group_id'] = groupId;
			var callback = cb || noop, self = this;
			xhrPut( this, {
		        url: self.host + '/event/' + eventId,
		        data: data,
		        success: function ( response ) {
		            callback.call( self.context || cb, expandEventToObject( fixEventResponse( response ) ) );
		        }
		    });
		}

		// ###Delete one event

		_PieceMakerApi.prototype.deleteEvent = function ( groupId, eventId, cb ) {
			var callback = cb || noop, self = this;
			if ( (typeof eventId === 'object') && ('id' in eventId) ) eventId = eventId.id;
			xhrDelete( this, {
		        url: self.host + '/event/' + eventId,
		        success: function ( response ) {
		            callback.call( self.context || cb , expandEventToObject( fixEventResponse( response ) ) );
		        }
		    });
		}

		// System related calls
		// ---------------------

		// ###Get the system (server) time

		_PieceMakerApi.prototype.getSystemTime = function ( cb ) {
			var callback = cb || noop, self = this;
			xhrGet( this, {
		        url: self.host + '/system/utc_timestamp',
		        success: function ( response ) {
		            callback.call( self.context || cb, new Date( response.utc_timestamp * 1000 ));
		        }
		    });
		}

		// Additional client methods
		// --------------------------

		// ###Create a callback to be used for the API calls

		_PieceMakerApi.prototype.createCallback = function () {
			if ( arguments.length == 1 ) {

				return self.context[arguments[0]];

			} else if ( arguments.length >= 2 ) {
				
				var more = 1;
				var cntx = self.context, meth = arguments[0];
				
				if ( typeof arguments[0] !== 'string' ) { // then it's not a method name
					cntx = arguments[0];
					if ( typeof arguments[1] !== 'string' ) {
						throw( 'createCallback(): if first argument is a target then the second needs to be a method name' );
					}
					meth = arguments[1];
					more = 2;
				}

				if ( arguments.length > more ) {
					var args = [];
					for ( var i = more; i < arguments.length; i++ ) {
						args.push( arguments[i] );
					}	
					return (function(c,m,a){
						return function(response) {
							if (response) a.unshift(response);
							c[m].apply( c, a );
						}
					})(cntx, meth, args);
				}
				else 
					return cntx[meth];
			}
			else
				throw( "createCallback(): wrong number of arguments" );
		}

	    return _PieceMakerApi;
	});

	// add it to the environment .. Node or browser window

	if ( typeof module !== 'undefined' && module.exports ) {

		var nodeAjax = function noop () {
			throw('Seems like you are running in neither a browser nor Node. Can\'t help you there.');
		};

		if ( typeof global !== 'undefined' ) { // check if environment could be Node

			var url = require('url'), 
				qstr = require('querystring'),
				http = require('http');
			
			// a shim to mimic jQuery.ajax for node.js
			nodeAjax = function nodeAjax (opts) {

				var url_parsed = url.parse(opts.url);
				var data = JSON.stringify( opts.data );

				var headers = opts.headers || {};
				headers['Content-Type'] = 'application/json';
				
				var query = null;

				if ( opts.type !== 'get' ) {
		    		headers['Content-Length'] = Buffer.byteLength( data, 'utf-8' );
		 		} else {
		 			var opts_data = opts.data || {};
		 			for ( var k in opts_data ) {
		 				if ( opts_data.hasOwnProperty(k) && typeof opts_data[k] === 'object' ) {
		 					var subObj = opts_data[k];
		 					for ( var kk in subObj ) {
		 						opts_data[k+'['+kk+']'] = subObj[kk];
		 					}
		 					delete opts_data[k];
		 				}
		 			}
		 			query = qstr.stringify( opts_data );
		 		}
		 
				var req_options = {
				    host 	: url_parsed.hostname,
				    port 	: url_parsed.port || 80,
				    path 	: url_parsed.path + ((opts.type === 'get' && query) ? '?' + query : ''),
				    method  : opts.type,
				    headers : headers
				};

				var request = http.request( req_options, function(res) {

				    if ( !(res.statusCode === 302 || res.statusCode <= 300) ) {
				    	opts.error.apply(null,[res]);
				    	return;
				    }

				 	var buf = '';
				    res.on( 'data', function(d) {
				        buf += d;
				    });
				    res.on( 'end', function() {
				    	opts.success.apply(opts.context,[JSON.parse(buf)]);
				    });
				});

				request.on('error', function(e) {
				    if ( opts.error ) opts.error.apply(null,[e]);
				});
		 
		 		if ( opts.type !== 'get' ) {
					request.write( data );
		 		}

				request.end();
			}
		}

		// support common-js
		module.exports = PieceMakerApi(nodeAjax);

	} else if ( window && !('PieceMakerApi' in window) ) {

		// browser
		window.PieceMakerApi = PieceMakerApi($.ajax);
	}

})();