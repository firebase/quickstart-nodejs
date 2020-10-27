/*
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseui = require('firebaseui');
const config = require('./config.js');
const $ = require('jquery');

/**
 * @param {string} name The cookie name.
 * @return {?string} The corresponding cookie value to lookup.
 */
function getCookie(name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig() {
  // This configuration supports email/password and Google providers.
  return {
    'callbacks': {
      // Called when the user has been successfully signed in.
      'signInSuccess': function(user, credential, redirectUrl) {
        // Handle signed in user.
        handleSignedInUser(user);
        // Do not automatically redirect.
        return false;
      },
      'uiShown': function() {
        // Remove progress bar when the UI is ready.
        document.getElementById('loading').classList.add('hidden');
      }
    },
    'signInFlow': 'popup',
    'signInOptions': [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
      },
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Whether the display name should be displayed in Sign Up page.
        requireDisplayName: true
      }
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com',
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE
  };
}

/**
 * Handles a signed in user. Sets the session cookie and then redirects to
 * profile page on success.
 * @param {!firebase.User} user
 */
const handleSignedInUser = function(user) {
  // Show redirection notice.
  document.getElementById('redirecting').classList.remove('hidden');
  // Set session cookie
  user.getIdToken().then(function(idToken) {
    // Session login endpoint is queried and the session cookie is set.
    // CSRF token should be sent along with request.
    const csrfToken = getCookie('csrfToken')
    return postIdTokenToSessionLogin('/sessionLogin', idToken, csrfToken)
      .then(function() {
        // Redirect to profile on success.
        window.location.assign('/profile');
      }, function(error) {
        // Refresh page on error.
        // In all cases, client side state should be lost due to in-memory
        // persistence.
        window.location.assign('/');
      });
  });
};

/**
 * @param {string} url The session login endpoint.
 * @param {string} idToken The ID token to post to backend.
 * @param {?string} csrfToken The CSRF token to send to backend.
 * @return {any} A jQuery promise that resolves on completion.
 */
const postIdTokenToSessionLogin = function(url, idToken, csrfToken) {
  // POST to session login endpoint.
  return $.ajax({
    type:'POST',
    url: url,
    data: {idToken: idToken, csrfToken: csrfToken},
    contentType: 'application/x-www-form-urlencoded'
  });
};

/**
 * Initializes the app.
 */
const initApp = function() {
  // Renders sign-in page using FirebaseUI.
  ui.start('#firebaseui-container', getUiConfig());
};

// Initialize Firebase app.
firebase.initializeApp(config);
// Set persistence to none.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
// On page ready, initialize app.
window.addEventListener('load', initApp);
