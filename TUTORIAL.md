# Test Security Rules with Firebase Emulators and Cloud Shell

## Introduction

Hi Firebase Security Rules developer! Welcome to Google Cloud Shell. We'll explain what this environment is all about shortly, but for now a quick orientation:

+   The panel you're reading this text in is called the Learn Assistant.
+   At left, the bottom panel is a full-featured command shell, essentially a Google-hosted virtual machine with this Web interface, called the Google Cloud Shell.
+   At left, a file browser and editor panel let you browse directories in this Cloud Shell instance and edit local files.

You're likely here by way of the Rules interface in Firebase console, interested in learning how you can use offline Firebase emulators to prototype and test Security Rules for your Firebase project.

The news is good. This Cloud Shell instance is already configured with Firebase emulators including Security Rules engine, and a simple testing framework designed with Security Rules development in mind.

Note: If you close this Learn Assistant panel by accident, at the Cloud Shell prompt, run `tutorial.sh`. You'll be prompted to resume the tutorial from where you left off.

To get started with the walkthrough...well, click `Start` below.

## What will you learn in this walkthrough?

We're hoping this walkthrough will teach you how to quickly access the Firebase Local Emulator Suite in a Cloud Shell environment, a **persistent** environment that you can drop back into whenever you need to debug Security Rules and don't have access to your own locally-installed Emulator Suite.

We also want to introduce the Firebase Test SDK, a Node.js plus mocha framework that is well-suited for prototyping and debugging Security Rules. Don't worry:

+   Running tests with Node.js and mocha is straightforward. Kicking off tests is a one-liner operation: `npm run test`.
+   We focus on Firebase emulators and Security Rules, not details of test frameworks that would distract from the lessons you're trying to learn.
+   We'll glance at but won't need to edit any test script. Instead, we'll concentrate on a  `firestore.rules` file, looking at rules statements that fail and iterating until rules operate the way you need them to.

After working with the Firestore and Security Rules emulator, you'll be able to initialize your Firebase project here in Cloud Shell and continue working on your own project's Security Rules.

## Check out a Security Rules tutorial project

Let's check some tutorial samples out of Google Cloud Source.

1.  Initialize Google Cloud SDK. Below, click the icon to copy the `gcloud init` command to the Cloud Shell prompt. Then follow the setup wizard, answering with these options:

    1.  First prompt: **option [1]** Re-initialize this configuration
    1.  Second prompt: **option [1]** {your cloud account IDe}
    1.  Third prompt: **option [2]** Create a new project. Enter a temporary project name. To guarantee uniqueness, append your Cloud account ID. For example `rules-test-janedoe`.

```bash  
gcloud init  
```

1.  Set up a directory structure to organize tutorial project files plus your own project(s).

> Note: Please create the following directory from the **root** of your Cloud Shell home directory.  
```bash  
cd ~; mkdir rules-tutorial  
```

1.  Switch to the tutorial working directory.

```bash  
cd ~/rules-tutorial  
```

1.  Check out the tutorial project from Cloud Source.

```bash  
gcloud source repos clone emulator-codelab --project=rachelmyers-wipeout-example  
```

1.  Change directory to the tutorial project.

```bash  
cd emulator-codelab/codelab-initial-state/functions/ 
```

1.  Install the Firebase Test SDK and a few more tools.

```bash  
npm install  
```

1.  Confirm the checkout was successful by running tests. It's OK if you see errors in the terminal. If you see `passing` and `failing` in the output, then the Test SDK and tools were correctly installed.

```bash  
npm run test  
```

## Using the Learn Assistant

This Learn Assistant has some convenient features we'll take advantage of for this walkthrough. Let's try them out.

Note: Be sure you've followed the previous topic and created the home directory structure explained there.

1.  You'll be opening files. Click to open <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules">a sample firebase.rules file</walkthrough-editor-open-file>.
1.  In those files, you'll read notes and instructions in code comments and make edits. Click to select <walkthrough-editor-select-line filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules" startLine=0 startCharacterOffset=0 endLine=4 endCharacterOffset=0>some code lines or introductory notes</walkthrough-editor-select-line>.
1.  You'll run commands at the Cloud Shell prompt, some that you copy/paste from the editor panel and some - as you've already discovered - you can launch directly from this Learn Assistant panel:

```bash   
echo "It is currently "$(date)   
```  
We'll present most of the walkthrough content and hands-on exercises this way, so get comfortable with this interaction.

## Security Rules basics

You'll get the most out of this walkthrough if you already have some experience with the Firestore Security Rules language and have modified the default `firestore.rules` with Rules tailored to your project. In this applies to you, you can click "Next" to move on.

Here are the basics about Rules statements. If these concepts are unfamiliar, you might review [Structuring Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure").

## Emulator Suite and Firebase Test SDK basics

Earlier we ran the test suite to make sure our tool setup and tutorial project checkout were successful. Now let's start up the Firestore emulator and run the test suite for real.

1.  Start the Firestore and Cloud Functions emulators.

```bash  
firebase emulators:start --only firestore,functions 
```

1.  Wait briefly until the Firestore and Cloud Functions emulators have started up. You'll see terminal output saying it's safe to connect.
1.  Add a new Cloud Shell session **(will try to use Spotlight to show this…).** Firestore emulator continues running in parallel, in our original session.
1.  At the new session prompt, change directory to our Rules walkthrough project.

```bash  
cd ~; cd ./rules-tutorial/emulator-codelab/codelab-initial-state/functions/
```

1.  Run the test suite.

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
1.  Open the test file, <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/functions/test.js">functions/test.js</walkthrough-editor-open-file>. 
1.  To fix the first failure, for the test case that a shopping cart can only be created by a shopping cart owner, replace the innermost match statement, to match only documents in the carts collection, and add an allow statement to allow creates only if the user who is making the request is the user listed as the cart owner. In the editor panel, back in <walkthrough-editor-open-file filePath="./rules-tutorial/emulator-codelab/codelab-initial-state/firestore.rules">firebase.rules</walkthrough-editor-open-file>, **replace the current rules set with the following**:

```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /carts/{cartID} {
          allow create: if request.auth.uid == request.resource.data.ownerUID;
        }
      }
    }
```

1.  Rerun the tests, and see that one more test passes. Good job!
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

## Initialize your Firebase project and continue with your own project's Security Rules

* **One topic** to demonstrate that user can `firebase init`, select their own project, work with their own rules...

...

+   When finished, `firebase deploy` to push your modified project files back to production. **Note that the deploy command puts your changes in production, not staging**, so be sure you're happy with changes to your Security Rules or other code before you deploy.

## What next?

OK, so we've:

+   Created a Firestore database using Firebase Local Emulator Suite, populated this database, and used it for live Security Rules evaluations.
+   Worked with a .rules file and a few predefined test cases using Firebase Test SDK to spot buggy Security Rules and quickly iterate fixes
+   Pushed updated Firebase project files to production from the Cloud Shell

At this point, we recommend you:

+   Learn more about Firebase Local Emulator Suite, including how to install and include it in your continuous integration environment, as well as how to use it for mobile app prototyping and testing.
+   Compare the Security Rules debugging experience you just had with the Emulator Suite to Rules debugging in the Security Rules Simulator in Firebase console. Each tool has its value.

**The Firebase console is likely still open in your browser. To complete this walkthrough and close Cloud Shell, simply close this browser tab. If you deployed your updated Security Rules, refresh the console Rules Simulator to see the updates**.

Remember, you can always return to Cloud Shell to check out and prototype your Firebase Security Rules and other project files and data.
