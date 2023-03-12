# Repository Reference

https://www.linkedin.com/pulse/real-time-image-classification-tensorflow-daniel-wind

https://github.com/danielwind/pictionary-tutorial

https://www.npmjs.com/package/@tensorflow-models/pose-detection

# To Test Run

Here we use extensively Tensorflow.js on the pose detection. Since their dependancies are not updated for now, we should use legacy-peer-deps to avoid library conflicts when npm install

```
npm install --legacy-peer-deps
```

The React Native Managed workflow Expo 46 is in use. You may then test run by typing:
```
npx expo start
```

# To Build An Android App

Since it is an Expo managed workflow 46, we need eas cli for building a standalone app.

Tidying up app.json to add/update version numbers before build.

Then let's see if eas.json is here, if not you may type:
```
eas build:configure
```
to create it.

You may notice that here we use app certs store in local certs/android or certs/ios instead of letting Expo manage the certs. If you want generate your own certs for Android app:
```
keytool -genkey -v -keystore posedetect.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

Then put the keystore file to the certs/android folder

The eas.json need to be adjusted to accommodate it as well.

Don't forget to:
```
touch credentials.json
```

and add the following to it
```
{
    "android": {
      "keystore": {
        "keystorePath": "certs/android/release.keystore",
        "keystorePassword": "xxxx",
        "keyAlias": "xxxx",
        "keyPassword": "xxxx"
      }
    },
    "ios": {
      "provisioningProfilePath": "certs/ios/xxx.mobileprovision",
      "distributionCertificate": {
        "path": "certs/ios/xxx.p12",
        "password": "xxxxxx"
      }
    }
}
```

You may then build an apk for testing:
```
eas build --profile preview --platform android
```

# To Build An iOS App

Two items need to be here: XXXXX.mobileprovision for the app itself and distribution.cer for the developer's app distribution right. Double clicking the .cer to generate .p12 cert. All of these can be generated from Apple Developer webpage

Remember to setup this item in eas.json to let the eas build find local certs instead of asking you for the login name and password of Apple Developer account:

```
...
    "production": {
      "credentialsSource": "local"
    }
...
```

Finally you may build a ips file for testing:
```
eas build --platform ios
```

# Version

0.1.1 - A functional Game with refactored Tensorflow JS module
0.2.0 - Fixed the memory leakage when looping the camera video
0.3.0 - Enabling the landscape only mode
0.4.0 - Monkey animation has been added
0.5.0 - 0.5.2 - Stretch exercise
0.6.0 - EAS update is installed