/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START imports]
const firebase = require('firebase-admin');
// [END imports]
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const escape = require('escape-html');

// TODO(DEVELOPER): Configure your email transport.
// Configure the email transport using the default SMTP transport and a GMail account.
// See: https://nodemailer.com/
// For other types of transports (Amazon SES, Sendgrid...) see https://nodemailer.com/2-0-0-beta/setup-transporter/
const mailTransport = nodemailer.createTransport('smtps://<user>%40gmail.com:<password>@smtp.gmail.com');

// TODO(DEVELOPER): Change the two placeholders below.
// [START initialize]
// Initialize the app with a service account, granting admin privileges
/** @type {any} */
const serviceAccount = require('../placeholders/service-account.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://<PROJECT_ID>.firebaseio.com'
});
// [END initialize]

/**
 * Send a new star notification email to the user with the given UID.
 */
// [START single_value_read]
function sendNotificationToUser(uid, postId) {
  // Fetch the user's email.
  const userRef = firebase.database().ref('/users/' + uid);
  userRef.once('value').then(function(snapshot) {
    const email = snapshot.val().email;
    // Send the email to the user.
    // [START_EXCLUDE]
    if (email) {
      sendNotificationEmail(email).then(function() {
        // Save the date at which we sent that notification.
        // [START write_fan_out]
        const update = {};
        update['/posts/' + postId + '/lastNotificationTimestamp'] =
            firebase.database.ServerValue.TIMESTAMP;
        update['/user-posts/' + uid + '/' + postId + '/lastNotificationTimestamp'] =
            firebase.database.ServerValue.TIMESTAMP;
        firebase.database().ref().update(update);
        // [END write_fan_out]
      });
    }
    // [END_EXCLUDE]
  }).catch(function(error) {
    console.log('Failed to send notification to user:', error);
  });
}
// [END single_value_read]


/**
 * Send the new star notification email to the given email.
 */
function sendNotificationEmail(email) {
  const mailOptions = {
    from: '"Firebase Database Quickstart" <noreply@firebase.com>',
    to: email,
    subject: 'New star!',
    text: 'One of your posts has received a new star!'
  };
  return mailTransport.sendMail(mailOptions).then(function() {
    console.log('New star email notification sent to: ' + email);
  });
}

/**
 * Update the star count.
 */
// [START post_stars_transaction]
function updateStarCount(postRef) {
  postRef.transaction(function(post) {
    if (post) {
      post.starCount = post.stars ? Object.keys(post.stars).length : 0;
    }
    return post;
  });
}
// [END post_stars_transaction]

/**
 * Keep the likes count updated and send email notifications for new likes.
 */
function startListeners() {
  firebase.database().ref('/posts').on('child_added', function(postSnapshot) {
    const postReference = postSnapshot.ref;
    const uid = postSnapshot.val().uid;
    const postId = postSnapshot.key;
    // Update the star count.
    // [START post_value_event_listener]
    postReference.child('stars').on('value', function(dataSnapshot) {
      updateStarCount(postReference);
      // [START_EXCLUDE]
      updateStarCount(firebase.database().ref('user-posts/' + uid + '/' + postId));
      // [END_EXCLUDE]
    }, function(error) {
      console.log('Failed to add "value" listener at /posts/' + postId + '/stars node:', error);
    });
    // [END post_value_event_listener]
    // Send email to author when a new star is received.
    // [START child_event_listener_recycler]
    postReference.child('stars').on('child_added', function(dataSnapshot) {
      sendNotificationToUser(uid, postId);
    }, function(error) {
      console.log('Failed to add "child_added" listener at /posts/' + postId + '/stars node:', error);
    });
    // [END child_event_listener_recycler]
  });
  console.log('New star notifier started...');
  console.log('Likes count updater started...');
}

/**
 * Send an email listing the top posts every Sunday.
 */
function startWeeklyTopPostEmailer() {
  // Run this job every Sunday at 2:30pm.
  schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 0}, function () {
    // List the top 5 posts.
    // [START top_posts_query]
    const topPostsRef = firebase.database().ref('/posts').orderByChild('starCount').limitToLast(5);
    // [END top_posts_query]
    const allUserRef = firebase.database().ref('/users');
    Promise.all([topPostsRef.once('value'), allUserRef.once('value')]).then(function(resp) {
      const topPosts = resp[0].val();
      const allUsers = resp[1].val();
      const emailText = createWeeklyTopPostsEmailHtml(topPosts);
      sendWeeklyTopPostEmail(allUsers, emailText);
    }).catch(function(error) {
      console.log('Failed to start weekly top posts emailer:', error);
    });
  });
  console.log('Weekly top posts emailer started...');
}

/**
 * Sends the weekly top post email to all users in the given `users` object.
 */
function sendWeeklyTopPostEmail(users, emailHtml) {
  Object.keys(users).forEach(function(uid) {
    const user = users[uid];
    if (user.email) {
      const mailOptions = {
        from: '"Firebase Database Quickstart" <noreply@firebase.com>',
        to: user.email,
        subject: 'This week\'s top posts!',
        html: emailHtml
      };
      mailTransport.sendMail(mailOptions).then(function() {
        console.log('Weekly top posts email sent to: ' + user.email);
        // Save the date at which we sent the weekly email.
        // [START basic_write]
        return firebase.database().ref().child('/users/' + uid + '/lastSentWeeklyTimestamp')
            .set(firebase.database.ServerValue.TIMESTAMP);
        // [END basic_write]
      }).catch(function(error) {
        console.log('Failed to send weekly top posts email:', error);
      });
    }
  });
}

/**
 * Creates the text for the weekly top posts email given an Object of top posts.
 */
function createWeeklyTopPostsEmailHtml(topPosts) {
  let emailHtml = '<h1>Here are this week\'s top posts:</h1>';
  Object.keys(topPosts).forEach(function(postId) {
    const post = topPosts[postId];
    emailHtml += '<h2>' + escape(post.title) + '</h2><div>Author: ' + escape(post.author) +
        '</div><div>Stars: ' + escape(post.starCount) + '</div><p>' + escape(post.body) + '</p>';
  });
  return emailHtml;
}

// Start the server.
startListeners();
startWeeklyTopPostEmailer();
