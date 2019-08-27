# Test Security Rules with Firebase Emulators and Cloud Shell

## Introduction

Hi Firebase Security Rules developer! Welcome to Google Cloud Shell. We'll explain what this environment is all about shortly, but for now a quick orientation:

+   The panel you're reading this text in is called the Learn Assistant.
+   At left, the bottom panel is a full-featured command shell, essentially a Google-hosted virtual machine with this Web interface, called the Google Cloud Shell.
+   At left, a file browser and editor panel let you browse directories in this Cloud Shell instance and edit local files.

You're likely here by way of the Rules interface in Firebase console, interested in learning how you can use offline Firebase emulators to prototype and test Security Rules for your Firebase project.

The news is good. This Cloud Shell instance is already configured with Firebase emulators including Security Rules engine, and a simple testing framework designed with Security Rules development in mind.

To get started with the walkthrough...well, click `Start` below.

## Check out a Security Rules tutorial project

Let's check some tutorial samples out of Google Cloud Source.

1.  Initialize Google Cloud SDK. Click the icon to copy the `gcloud init` command to the Cloud Shell prompt.
```bash  
gcloud init  
```
**Note:** follow the setup wizard, answering with these options:

    a.  First prompt: **option [1]** Re-initialize this configuration

    b.  Second prompt: **option [1]** {your cloud account ID}

    c.  Third prompt: **option [2]** Create a new project. Enter a temporary project name. To guarantee uniqueness, append your Cloud account ID. For example `rules-test-janedoe`.

2.  Set up a directory structure to organize tutorial project files plus your own project(s).

> Note: Please create the following directory from the **root** of your Cloud Shell home directory.  
```bash  
cd ~; mkdir rules-tutorial  
```

3.  Switch to the tutorial working directory.

```bash  
cd ~/rules-tutorial  
```

4.  Check out the tutorial project from Cloud Source.

```bash  
gcloud source repos clone emulator-codelab --project=rachelmyers-wipeout-example  
```

5.  Change directory to the tutorial project.

```bash  
cd emulator-codelab/codelab-initial-state/functions/ 
```

6.  Install the Firebase Test SDK and a few more tools.

```bash  
npm install  
```

7.  Confirm the checkout was successful by running tests. It's OK if you see errors in the terminal. If you see `passing` and `failing` in the output, then the Test SDK and tools were correctly installed.

```bash  
npm run test  
```

## Using the Learn Assistant

This Learn Assistant has some convenient features we'll take advantage of for this walkthrough. Let's try them out.

Note: Be sure you've followed the previous topic and created the home directory structure explained there.

1.  You'll be opening files. Click to open <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules">a sample firebase.rules file</walkthrough-editor-open-file>.
2.  In those files, you'll read notes and instructions in code comments and make edits. Click to select <walkthrough-editor-select-line filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules" startLine=0 startCharacterOffset=0 endLine=4 endCharacterOffset=0>some code lines or introductory notes</walkthrough-editor-select-line>.
3.  You'll run commands at the Cloud Shell prompt, some that you copy/paste from the editor panel and some - as you've already discovered - you can launch directly from this Learn Assistant panel:

```bash   
echo "It is currently "$(date)   
```  
We'll present most of the walkthrough content and hands-on exercises this way, so get comfortable with this interaction.

## Security Rules basics

You'll get the most out of this walkthrough if you already have some experience with the Firestore Security Rules language and have in your own project modified the default `firestore.rules` with Rules tailored to your data. 
**If this applies to you, you can click "Next" to move on**.

Here are the basics about Rules statements. If these concepts are unfamiliar, you might review [Structuring Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure).

### Service and database declaration
Cloud Firestore Security Rules always begin with the following declaration:
```
service cloud.firestore {
  match /databases/{database}/documents {
    // ...
  }
}
```
The service cloud.firestore declaration scopes the rules to Cloud Firestore, preventing conflicts between Cloud Firestore Security Rules and rules for other products such as Cloud Storage.

The match /databases/{database}/documents declaration specifies that rules should match any Cloud Firestore database in the project. Currently each project has only a single database named (default).

### Basic read/write rules
Basic rules consist of a match statement specifying a document path and an allow expression detailing when reading the specified data is allowed:
```
service cloud.firestore {
  match /databases/{database}/documents {

    // Match any document in the 'cities' collection
    match /cities/{city} {
      allow read: if <condition>;
      allow write: if <condition>;
    }
  }
}
```
All match statements should point to documents, not collections. A match statement can point to a specific document, as in match /cities/SF or use wildcards to point to any document in the specified path, as in match /cities/{city}.

## Emulator Suite and Firebase Test SDK basics

Earlier we ran the test suite to make sure our tool setup and tutorial project checkout were successful. Now let's start up the Firestore emulator and run the test suite for real.

1.  Start the Firestore and Cloud Functions emulators.

```bash  
firebase emulators:start --only firestore,functions 
```

2.  Wait briefly until the Firestore and Cloud Functions emulators have started up. You'll see terminal output saying it's safe to connect.
3.  Add a <walkthrough-spotlight-pointer spotlightId="devshell-add-tab-button">new Cloud Shell session</walkthrough-spotlight-pointer>. Firestore emulator continues running in parallel, in our original session.
4.  At the new session prompt, change directory to our Rules walkthrough project.

```bash  
cd ~; cd ./rules-tutorial/emulator-codelab/codelab-initial-state/functions/
```

5.  Run the test suite.

```bash  
npm run test  
```  
Awesome. We're going to peek under the hood next, but the gist is our test suite populated the Firestore emulator with data and made a series of access requests, which were allowed and denied according to our Security Rules, and checked per our test cases.

## Let users create shopping carts

In the editor panel, switch to the <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules">firestore.rules tab</walkthrough-editor-open-file> if you're not already there.. 

This and the test script files are where we'll iterate to make sure that our application will protect user data. We see that we have the default rules created in open mode; everyone is allowed to read or write to any part of this database. We don’t want to ship our app like that, so we’ll tailor the Security Rules to our specific application.

1.  Run the tests again, and notice the first error.
```bash
npm run test
```
2.  Open the test file, <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/functions/test.js">functions/test.js</walkthrough-editor-open-file>. 
3.  To fix the first failure, for the test case that a shopping cart can only be created by a shopping cart owner, replace the innermost match statement, to match only documents in the carts collection, and add an allow statement to allow creates only if the user who is making the request is the user listed as the cart owner. In the editor panel, back in <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules">firebase.rules</walkthrough-editor-open-file>, **replace the current rules set with the following**:

```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /carts/{cartID} {
          allow create: if request.auth.uid == request.resource.data.ownerUID;
        }
      }
    }
```

4.  Rerun the tests, and see that one more test passes. Good job!
```bash
npm run test
```

## Let users update and delete shopping carts

Next, we'll cover the case when a user wants to update or delete a cart. In that case, we want a different rule, that checks the ownerUID that saved in the document rather than the ownerUID sent in the request:

1. Replace the contents of `firestore.rules` with the following:
```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /carts/{cartID} {
          allow create: if request.auth.uid == request.resource.data.ownerUID;
          allow update, delete: if request.auth.uid == resource.data.ownerUID;
        }
      }
    }
```
2. Switch to the Cloud Shell session in which the emulators are running.
2. Re-run the test suite.
  Rerun the tests, and see that one more test passes. Good job!
```bash
npm run test
```

## Let users look in their shopping carts

When we rerun the tests, we find that the next failure is that although cart owners can write to their cart, they can't read it. Since we want cart owners to be the only ones to read their carts, modify the update and delete rule to also allow reads:

1. Replace the contents of `firestore.rules` with the following:
```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /carts/{cartID} {
          allow create: if request.auth.uid == request.resource.data.ownerUID
          allow read, update, delete: if request.auth.uid == resource.data.ownerUID;
        }
      }
    }
```
2. Re-run the test suite.
  Rerun the tests, and see that one more test passes. Good job!
```bash
npm run test
```

## Let users put items in their cart

Rerunning the tests, we find that the tests around cart documents pass, but the tests for the `items` subcollections are not passing. The cart owner should be able to read or write to that subcollection, so we can write one last rule that will allow access if the user accessing the items data has the same UID as the ownerUID on the cart document:

1. Replace the contents of `firestore.rules` with the following:
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /carts/{cartID} {
      allow create: if request.auth.uid == request.resource.data.ownerUID;
      allow read, update, delete: if request.auth.uid == resource.data.ownerUID;
    }
    match /carts/{cartID}/items/{itemID} {
      allow read, write: if get(/databases/$(database)/documents/carts/$(cartID)).data.ownerUID == request.auth.uid;
    }
  }
}
```
2. Re-run the test suite.
  Rerun the tests, and see that one more test passes. Good job!
```bash
npm run test
```
Now our shopping cart data is secure, and tested. If this were a production application, we could add these tests to our CI tests, to have confidence going forward that our shopping cart data would stay secure. 

## What next?

OK, so we've:

+   Created a Firestore database using Firebase Local Emulator Suite, populated this database, and used it for live Security Rules evaluations.
+   Worked with a .rules file and a few predefined test cases using Firebase Test SDK to spot buggy Security Rules and quickly iterate fixes

At this point, we recommend you:

+   Learn more about Firebase Local Emulator Suite, including how to install and include it in your continuous integration environment, as well as how to use it for mobile app prototyping and testing.
+   Compare the Security Rules debugging experience you just had with the Emulator Suite to Rules debugging in the Security Rules Simulator in Firebase console. Each tool has its value.

**The Firebase console is likely still open in your browser. To complete this walkthrough and close Cloud Shell, simply close this browser tab.**

Remember, you can always return to Cloud Shell to check out and prototype your Firebase Security Rules and other project files and data.
