# README #

This README would normally document whatever steps are necessary to get your application up and running.

### This is the repo for Openprice Mobile App code. ###

Developer Guide
================

## Local Development Environment Setup ##
First you need to install and setup tools needed for local development. Prefer Ubuntu or Mac OS X. Avoid Windows.

### NodeJS ###

Install [NodeJS 4.2.x LTS](https://nodejs.org/)

### Javascript Tools ###

Install gulp and bower
~~~
npm install -g gulp
npm install -g bower
~~~

Install Cordova and Ionic
~~~
npm install -g cordova
npm install -g ionic
~~~

### ATOM ###
Install [ATOM Text Editor](https://atom.io/).

Or [MS Visual Studio Code](https://code.visualstudio.com/).

This is optional. You can choose whatever Text Editor tool for Web development.

### Others ###

For iOS development, you need to install xcode to your Mac OS X.

For Android development, you need to install [Android SDK](https://developer.android.com/sdk/installing/index.html).

Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

Install [Docker](https://docs.docker.com/installation/)

### Github Account
Create free account in Github:
[https://github.com/](https://github.com/)

Ask admin to add your account to groundtruth (opgt).

Setup [SSH key for Github](https://help.github.com/articles/generating-ssh-keys/)

Fork the project from [Open Price Backend Project](https://github.com/opgt/op-backend)
to your personal account through Web UI at Github.

### Checkout code
Create a local folder for `~/groundtruth/git`, and check out the code from Github your private repository for **op-mobile** to this folder.
```
git clone git@github.com:opgt/op-mobile.git
```
## Run Openprice Mobile Project locally first time ##

### Install dependencies ###

First time, you need to install node modules and bower components, and cordova platforms. inside openprice-mobile folder, run
```
npm install
bower install
ionic platform add ios
ionic platform add android
```

Then check your cordova platform by
```
cordova platform list
```

If the output says android version is less than 5.0.x, please upgrade cordova:
```
cordova platform update android@5.0.0
```

After making sure you have cordova android platform > 5.0, you can install several cordova plugins:
```
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
cordova plugin add https://github.com/jiwhiz/cordova-plugin-camera.git
cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git
cordova plugin add org.apache.cordova.splashscreen
```

### Run with Browser ###
You can run Openprice mobile app inside browser with Ionic:
```
ionic serve
```
It will open a browser window and display the login page. By default, it will connect to DEV server running in Google Cloud. You can register an account and login with this account.

To work with local servers running inside docker containers, for Windows/MacOSX, run
```
env=localdocker ionic serve
```

For Linux PC, run
```
env=local ionic serve
```

### Run in Android Phone ###
You can connect your Android phone with your computer and run mobile app in it:
```
ionic build android
ionic run android
```

## On-going Development Process ##
The master branch is for production release, and for each developer, we are all working on
release branch, such as release1, release2, etc.


So we need to switch to development branch, such as release2:

```
git checkout release3
```

After you have done code changes, you first need to commit it, for example:
```
git add .
git commit -m 'my code change for issue-31'
```

Then you merge with remote release branch, then push the changes:

```
git pull
git push
```

If `git pull` return merge error, you need to manually fix the merge conflict, before push.
