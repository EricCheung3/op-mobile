# README #

This README would normally document whatever steps are necessary to get your application up and running.

### This is the repo for OpenPrice Phone App code. ###

Developer Guide
================

## Local Development Environment Setup ##
First you need to install and setup tools needed for local development. Prefer Ubuntu or Mac OS X. Avoid Windows.

### NodeJS ###

Install [NodeJS 0.12.7](https://nodejs.org/)

### Javascript Tools ###

Install gulp and bower
~~~
npm install -g gulp
npm install -g bower
~~~

Install Cordova and Ionic
~~~
npm install -g cordova ionic
~~~

### ATOM ###
Install [ATOM Text Editor](https://atom.io/)

This is optional. You can choose whatever Text Editor tool for Web development.

### Others ###

For iOS development, you need to install xcode to your Mac OS X.

For Android development, you need to install [Android SDK](https://developer.android.com/sdk/installing/index.html).

Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

Install [Docker](https://docs.docker.com/installation/)

## Bitbucket Account ##

Create free account in Bitbucket:
[https://bitbucket.org/](https://bitbucket.org/)

Ask admin to add your account to groundtruthinc team.

Setup [SSH key for Bitbucket](https://confluence.atlassian.com/display/BITBUCKET/How+to+install+a+public+key+on+your+Bitbucket+account)

Fork the project from [GroundTruth Open Price Mobile Project](https://bitbucket.org/groundtruthinc/openprice-mobile)
to your personal account through Web UI at Bitbucket.

See [Software Development Life Cycle document](https://bitbucket.org/groundtruthinc/openpriceproj/wiki/SDLC)
for detail process.

## Run OpenPrice Mobile Project locally first time ##

### Checkout code ###
Check out the code from Bitbucket your private repository for **openprice-mobile**.

### Install dependencies ###

First time, you need to install node modules and bower components, and cordova platforms. inside openprice-mobile folder, run
```
npm install
bower install
ionic platform add ios
ionic platform add android
```

You also need to install several cordova plugs:
```
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
cordova plugin add https://github.com/EricCheung3/cordova-plugin-camera.git
cordova plugin add org.apache.cordova.splashscreen
```

### Run with Brwoser ###
You can run OpenPrice mobile app inside browser with Ionic:
```
ionic serve
```
It will open a browser window and display the login page. You can register an account and login with this account.

### Run in Android Phone ###
You can connect your Android phone with your computer and run mobile app in it:
```
ionic build android
ionic run android
```

