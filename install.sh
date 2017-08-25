## LMS installation script
echo "Installing LMS and its dependencies..."
INSTALLING="/home/volumio/lms-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	# http://downloads.slimdevices.com/LogitechMediaServer_v7.9.0/logitechmediaserver_7.9.0_arm.deb
	url="http://www.mysqueezebox.com/update/?version=7.9.0&revision=1&geturl=1&os=deb"
	latest_lms=$(wget -q -O - "$url")
	mkdir -p /sources
	cd /sources
	wget $latest_lms
	lms_deb=${latest_lms##*/}
	sudo dpkg -i $lms_deb

	# mkdir /var/log/squeezeboxserver/
	# chown squeezeboxserver /var/log/squeezeboxserver/
	# chmod 775 /var/log/squeezeboxserver/

	# Add the systemd unit
	rm /etc/systemd/system/squeezeboxserver.service	
	wget -O /etc/systemd/system/squeezeboxserver.service https://raw.githubusercontent.com/Saiyato/volumio-kodi-plugin/master/kodi_configuration/guisettings.xml
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
