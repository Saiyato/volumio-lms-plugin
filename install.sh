## LMS installation script
echo "Installing LMS and its dependencies..."
INSTALLING="/home/volumio/lms-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	# Download LMS 7.9.0
	mkdir -p /home/volumio/logitechmediaserver
	wget -O /home/volumio/logitechmediaserver http://downloads.slimdevices.com/LogitechMediaServer_v7.9.0/logitechmediaserver_7.9.0_arm.deb
	
	# Install package and dependencies
	for f in /home/volumio/logitechmediaserver/logitechmediaserver*.deb; do dpkg -i "$f"; done
	apt-get -f install

	mkdir /var/lib/squeezeboxserver
	chown volumio:volumio /var/lib/squeezeboxserver

	# Add the systemd unit
	rm /etc/systemd/system/squeezeboxserver.service	
	wget -O /etc/systemd/system/squeezeboxserver.service https://raw.githubusercontent.com/Saiyato/volumio-lms-plugin/master/units/squeezeboxserver.service
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
