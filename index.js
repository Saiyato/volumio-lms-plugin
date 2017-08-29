'use strict';

var libQ = require('kew');
var libNet = require('net');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var net = require('net');

// Define the ControllerLMS class
module.exports = ControllerLMS;

function ControllerLMS(context) 
{
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

};

ControllerLMS.prototype.onVolumioStart = function()
{
	var self = this;
	self.logger.info("LMS initiated");
	
	this.configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	self.getConf(this.configFile);
	
	return libQ.resolve();	
};

ControllerLMS.prototype.getConfigurationFiles = function()
{
	return ['config.json'];
};

// Plugin methods -----------------------------------------------------------------------------
ControllerLMS.prototype.onStop = function() {
	var self = this;
	var defer = libQ.defer();

	self.stopService('logitechmediaserver')
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Stopping failed", "Could not stop the LMS plugin in a fashionable manner, error: " + e);
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerLMS.prototype.stop = function() {
	var self = this;
	var defer = libQ.defer();

	self.stopService('logitechmediaserver')
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Stopping failed", "Could not stop the LMS plugin in a fashionable manner, error: " + e);
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerLMS.prototype.onStart = function() {
	var self = this;
	var defer = libQ.defer();

	self.restartService('logitechmediaserver', true)
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Startup failed", "Could not start the LMS plugin in a fashionable manner.");
		self.logger.info("Could not start the LMS plugin in a fashionable manner.");
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerLMS.prototype.onRestart = function() 
{
	// Do nothing
	self.logger.info("performing onRestart action");
	
	var self = this;
};

ControllerLMS.prototype.onInstall = function() 
{
	self.logger.info("performing onInstall action");
	
	var self = this;
};

ControllerLMS.prototype.onUninstall = function() 
{
	// Perform uninstall tasks here!
};

ControllerLMS.prototype.getUIConfig = function() {
    var self = this;
	var defer = libQ.defer();    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.getConf(this.configFile);
	self.logger.info("Loaded the previous config.");
	
	self.commandRouter.i18nJson(__dirname+'/i18n/strings_' + lang_code + '.json',
		__dirname + '/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
    .then(function(uiconf)
    {
		self.logger.info("## populating UI...");
		
		var indexOfSectionToRemove =
                self.config.get('enabled') == true
                    ? 0
                    : 1;
					
		self.logger.info('REMOVING INDEX: ' + indexOfSectionToRemove);
		
		// Server settings
		uiconf.sections[0].content[0].value = self.config.get('enabled');
		self.logger.info("1/1 environment settings loaded");
		
		uiconf.sections.splice(indexOfSectionToRemove, 1);
		self.logger.info("Populated config screen.");
		self.generateDependencylist();
		
		defer.resolve(uiconf);
	})
	.fail(function()
	{
		defer.reject(new Error());
	});

	return defer.promise;
};

ControllerLMS.prototype.setUIConfig = function(data) {
	var self = this;
	
	self.logger.info("Updating UI config");
	var uiconf = fs.readJsonSync(__dirname + '/UIConfig.json');
	
	return libQ.resolve();
};

ControllerLMS.prototype.getConf = function(configFile) {
	var self = this;
	this.config = new (require('v-conf'))()
	this.config.loadFile(configFile)
	
	return libQ.resolve();
};

ControllerLMS.prototype.setConf = function(conf) {
	var self = this;
	return libQ.resolve();
};

// Public Methods ---------------------------------------------------------------------------------------

ControllerLMS.prototype.updateLMSConfiguration = function (data)
{
	var self = this;
	var defer = libQ.defer();
	
	self.config.set('enabled', data['enabled']);
	self.logger.info("Successfully updated LMS configuration");

	if(data['enabled'] == true)
	{
		self.restartService("logitechmediaserver", false)
		.then(function(edefer)
		{
			defer.resolve();
		})
		.fail(function()
		{
			self.commandRouter.pushToastMessage('error', "Restart failed", "Restarting logitechmediaserver failed with error: " + error);
			defer.reject(new Error());
		});
	}
	else
	{
		self.stopService("logitechmediaserver")
		.then(function(edefer)
		{
			defer.resolve();
		})
		.fail(function()
		{
			self.commandRouter.pushToastMessage('error', "Stopping failed", "Stopping logitechmediaserver failed with error: " + error);
			defer.reject(new Error());
		});
	}
	
	return defer.promise;
}

ControllerLMS.prototype.redirectToWebconsole = function (data)
{

}

ControllerLMS.prototype.restartService = function (serviceName, boot)
{
	var self = this;
	var defer=libQ.defer();

	if(self.config.get('enabled'))
	{
		var command = "/usr/bin/sudo /bin/systemctl restart " + serviceName;
		
		exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
			if (error !== null) {
				self.commandRouter.pushConsoleMessage('The following error occurred while starting ' + serviceName + ': ' + error);
				self.commandRouter.pushToastMessage('error', "Restart failed", "Restarting " + serviceName + " failed with error: " + error);
				defer.reject();
			}
			else {
				self.commandRouter.pushConsoleMessage(serviceName + ' started');
				if(boot == false)
					self.commandRouter.pushToastMessage('success', "Restarted " + serviceName, "Restarted " + serviceName + " for the changes to take effect.");
				
				defer.resolve();
			}
		});
	}
	else
	{
		self.logger.info("Not starting " + serviceName + "; it's not enabled.");
		defer.resolve();
	}

	return defer.promise;
}

ControllerLMS.prototype.stopService = function (serviceName)
{
	var self = this;
	var defer=libQ.defer();

	var command = "/usr/bin/sudo /bin/systemctl stop " + serviceName;
	
	exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while stopping ' + serviceName + ': ' + error);
			self.commandRouter.pushToastMessage('error', "Stopping service failed", "Stopping " + serviceName + " failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage(serviceName + ' stopped');
			self.commandRouter.pushToastMessage('success', "Stopping", "Stopped " + serviceName + ".");
			defer.resolve();
		}
	});

	return defer.promise;
}

ControllerLMS.prototype.replaceStringInFile = function (pattern, value, inFile)
{
	var self = this;
	var defer = libQ.defer();
	var castValue;
	
	if(value == true || value == false)
			castValue = ~~value;
	else
		castValue = value;

	var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/sed -i -- 's|" + pattern + ".*|" + castValue + "|g' " + inFile;

	exec(command, {uid:1000, gid:1000}, function (error, stout, stderr) {
		if(error)
			console.log(stderr);

		defer.resolve();
	});
	
	return defer.promise;
}

ControllerLMS.prototype.generateDependencylist = function ()
{
	fs.readdir(__dirname + "/node_modules", function (err, dirs) {
    if (err) {
      console.log(err);
      return;
    }
    dirs.forEach(function(dir){
      if (dir.indexOf(".") !== 0) {
        var packageJsonFile = __dirname + "/node_modules/" + dir + "/package.json";
        if (fs.existsSync(packageJsonFile)) {
          fs.readFile(packageJsonFile, function (err, data) {
            if (err) {
              console.log(err);
            }
            else {
              var json = JSON.parse(data);
              self.logger.info('"'+json.name+'": "' + json.version + '",');
            }
          });
        }
      }
    });

  });
}