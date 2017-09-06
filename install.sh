## LMS installation script
echo "Installing LMS and its dependencies..."
INSTALLING="/home/volumio/lms-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	apt-get update
	
	# Download LMS 7.9.0
	echo "Downloading installation package..."
	mkdir /home/volumio/logitechmediaserver
	wget -O /home/volumio/logitechmediaserver/logitechmediaserver_7.9.0_arm.deb http://downloads.slimdevices.com/LogitechMediaServer_v7.9.0/logitechmediaserver_7.9.0_arm.deb
	
	# Install package and dependencies
	echo "Installing downloaded package"
	for f in /home/volumio/logitechmediaserver/logitechmediaserver*.deb; do dpkg -i "$f"; done
	apt-get -f install
	
	# Needed for SSL connections
	apt-get install libio-socket-ssl-perl lame -y
	
	# Get compiled CPAN for current Perl Version and Link it if not existing
	PERLV=$(perl -v | grep -o "(v[0-9]\.[0-9]\+" | sed "s/(v//;s/)//")
	var=$(awk 'BEGIN{ print "'$PERLV'"<"'5.20'" }')
	if [ "$var" -eq 0 -a ! -e /usr/share/squeezeboxserver/CPAN/arch/$PERLV/arm-linux-gnueabihf-thread-multi-64int/ ]; then
		# get CPAN if not existing
		if [ ! -e /opt/CPAN/$PERLV/arm-linux-gnueabihf-thread-multi-64int/ ]; then
			wget -O /home/volumio/logitechmediaserver/CPAN_PERL_ALL.tar.gz https://github.com/Saiyato/volumio-lms-plugin/raw/master/known_working_versions/CPAN_PERL_ALL.tar.gz
			tar -xvzf /home/volumio/logitechmediaserver/CPAN_PERL_ALL.tar.gz -C /opt/
			echo "Download CPAN for Perl $PERLV"
		fi
		ln -sf /opt/CPAN/$PERLV/arm-linux-gnueabihf-thread-multi-64int/ /usr/share/squeezeboxserver/CPAN/arch/$PERLV/arm-linux-gnueabihf-thread-multi-64int
		echo "Linking CPAN to Perl $PERLV"
		sleep 4
	else
		ln -sf /opt/CPAN/arm-linux-gnueabihf-thread-multi-64int/ /usr/share/squeezeboxserver/CPAN/arch/5.18/
		echo "Linking CPAN to Latest"
	fi
	
	# These directories still use the old name; probably legacy code
	echo "Fixing directory rights"
	mkdir /var/lib/squeezeboxserver
	chown -R volumio:volumio /var/lib/squeezeboxserver
	
	# Add the squeezeboxserver user to the audio group
	usermod -aG audio squeezeboxserver

	# Add the systemd unit
	rm /etc/systemd/system/logitechmediaserver.service	
	wget -O /etc/systemd/system/logitechmediaserver.service https://raw.githubusercontent.com/Saiyato/volumio-lms-plugin/master/unit/logitechmediaserver.service
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
