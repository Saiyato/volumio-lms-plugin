## LMS installation script
echo "Installing LMS and its dependencies..."
INSTALLING="/home/volumio/lms-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	# Download LMS 7.9.0
	echo "Downloading installation package..."
	mkdir /home/volumio/logitechmediaserver
	wget -O /home/volumio/logitechmediaserver/logitechmediaserver_7.9.0_arm.deb http://downloads.slimdevices.com/LogitechMediaServer_v7.9.0/logitechmediaserver_7.9.0_arm.deb
	
	# Install package and dependencies
	echo "Installing downloaded package"
	for f in /home/volumio/logitechmediaserver/logitechmediaserver*.deb; do dpkg -i "$f"; done
	apt-get -f install
	
	# These directories still use the old name; probably legacy code
	echo "Fixing directory rights"
	mkdir /var/lib/squeezeboxserver
	chown -R volumio:volumio /var/lib/squeezeboxserver

	# Add the systemd unit
	rm /etc/systemd/system/logitechmediaserver.service	
	wget -O /etc/systemd/system/logitechmediaserver.service https://raw.githubusercontent.com/Saiyato/volumio-lms-plugin/master/units/logitechmediaserver.service
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
