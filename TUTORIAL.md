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

Let's check some tutorial samples out from GitHub and some tools out of npm. 

![Copy to Cloud Shell control](https://walkthroughs.googleusercontent.com/content/firebase_rules/images/la_copy_to_shell_shrink.png "Copy to Cloud Shell control") -- in the snippets below, use this control to paste commands straight to the Cloud Shell prompt.

1.  Set up a directory structure to organize tutorial project files plus your own project(s).

> Note: As shown below, please create the following directory from the **root** of your Cloud Shell home directory.  
```bash  
cd ~; mkdir rules-tutorial  
```

2.  Switch to the tutorial working directory.

```bash  
cd ~/rules-tutorial  
```

3.  Check out the tutorial project from Github.

```bash  
git clone -b rpb/markarndt https://github.com/firebase/quickstart-nodejs
```

4.  Change directory to the tutorial project.

```bash  
cd quickstart-nodejs/cs-walkthrough/
```

4.  Install the Firebase Test SDK and a few more tools.

```bash  
npm --prefix=functions install  
```

## Using the Learn Assistant

OK, setup is done.

This Learn Assistant has some convenient features we'll take advantage of for this walkthrough. Let's try them out.

Note: Be sure you've followed the previous topic and created the home directory structure explained there.

1.  You'll be **opening** a series of Security Rules template files. Click to open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_0">the first, which is firebase.rules_template_0</walkthrough-editor-open-file>.
2.  In those template files, you'll **review** descriptions and comments on security rules. Click to select <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_0" startLine=6 startCharacterOffset=0 endLine=7 endCharacterOffset=0>some discussion of a rule definition</walkthrough-editor-select-line>.
3.  After reviewing rule definitions, you'll **edit** rules and **save the changes** in preparation for re-running the test suite. Click to select <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_0" startLine=7 startCharacterOffset=0 endLine=9 endCharacterOffset=0>code modification instructions</walkthrough-editor-select-line>.
4.  At the Cloud Shell prompt, you'll **copy the template file to update your main tutorial firestore.rules file**.

```bash   
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_0 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```  
We'll present most of the walkthrough content and hands-on exercises this way, so repeat the above sequence as many times as you like to get comfortable with this interaction.

## Security Rules basics

You'll get the most out of this walkthrough if you already have some experience with the Firestore Security Rules language and have in your own project modified the default ```firestore.rules``` file with rules tailored to your data. 
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
Basic rules consist of a ```match``` statement specifying a document path and an ```allow``` expression detailing when reading the specified data is allowed:
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

Let's start up the Firestore emulator and run the test suite developed with the Firebase Test SDK.

1.  Start the Firestore and Cloud Functions emulators.

```bash  
firebase emulators:start --only firestore,functions 
```

2.  Wait briefly until the Firestore and Cloud Functions emulators have started up. You'll see terminal output saying it's safe to connect.
3.  Add a <walkthrough-spotlight-pointer cssSelector="#devshell-editor-app;div.p6n-devshell-editor-app-body.layout-row.flex;div.layout-column.flex;pan-dev-shell;div;div.p6n-devshell-header.p6n-action-bar;div:nth-child(6);csh-new-tab-menu;div;button.main.dense.mat-icon-button.mat-button-base;span;mat-icon
">new Cloud Shell session</walkthrough-spotlight-pointer>. You can do so manually by clicking the + control ("Open a new tab") in the menu above the Cloud Shell terminal window. The emulators keep running in parallel, in our original session.
4.  At the new session prompt, change directory to our Security Rules walkthrough project.

```bash  
cd ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/
```

5.  Run the test suite.

```bash  
npm --prefix=functions test  
```  
Awesome. We're going to peek under the hood next, but the gist is our test suite populated the Firestore emulator with data and made a series of access requests, which were allowed and denied according to our Security Rules, and checked per our test cases.

All of the tests pass, isn't that great? Well, that depends on how secure our app *really* is and just what exactly the tests are confirming. Let's take a look...

## What data are we securing?

Our tests are written with a simple eCommerce app in mind. We have ```users```, and database entries for shopping ```carts```, and ```items``` to put in those carts. All of this data will be created as wel go by the Firebase Test SDK.

![Copy to Cloud Shell control](https://firebase.devsite.corp.google.com/docs/rules/images/cs_walkthrough_datamodel_856.png "eCommerce Data Model for Security Rules Walkthrough")

## Lock down Security Rules

The default ```firestore.rules``` in this walkthrough are set with open security. That is, all operations are permitted on all documents in the database. Our rules tests confirm that operations on the database are permitted, so everything passes.

The Firebase emulators are waiting for more database interactions and Security Rules evaluations, so let's update ```firestore.rules``` to improve security and re-run the tests!

1. Open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_1">firestore.rules_template_1</walkthrough-editor-open-file>. 

2. **Review** the two rules definitions in this file:

* A definition that applies to all documents in the database, <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_1" startLine=9 startCharacterOffset=0 endLine=14 endCharacterOffset=0>here</walkthrough-editor-select-line>.
* A definition that applies to items in the items collection, <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_1" startLine=25 startCharacterOffset=0 endLine=31 endCharacterOffset=0>here</walkthrough-editor-select>.

3. Now **edit the rules** to <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_1" startLine=14 startCharacterOffset=0 endLine=23 endCharacterOffset=0>begin tightening security</walkthrough-editor-select-line>.

4. Using your modified and **saved** firestore.rules_template_1 file, **copy/replace to update firestore.rules**.
```bash
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_1 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```

5.  Run the tests again.
```bash
npm --prefix=functions test  
```

We've now fully locked down the data, so we go from 4 test successes to 4 failures. But now that we're secure, we can start to allow database access with appropriate rules.


## Let users create shopping carts

First let's look at at letting users create carts in a secure way.

1. Open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2">firestore.rules_template_2</walkthrough-editor-open-file>. 

2. **Review** and **edit** the ```match``` statement controlling access to ```cart``` documents:

* Review the ```match``` statement <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2" startLine=10 startCharacterOffset=0 endLine=14 endCharacterOffset=0>here</walkthrough-editor-select-line>.

* Edit the ```match``` statement <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2" startLine=14 startCharacterOffset=0 endLine=18 endCharacterOffset=0>here</walkthrough-editor-select-line>.

3. Now **review** and **edit** the ```allow``` statement to narrow down who can interact with selected ```cart``` documents:

* Review the notes about the current and proposed ```allow``` statement <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2" startLine=18 startCharacterOffset=0 endLine=20 endCharacterOffset=0>here</walkthrough-editor-select-line>.

* And then edit <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2" startLine=20 startCharacterOffset=0 endLine=24 endCharacterOffset=0>here</walkthrough-editor-select-line>.

4. **Copy** the modified and **saved** firestore.rules_template_2 file to update ```firestore.rules```.
```bash
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_2 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```

5.  Run the tests again.
```bash
npm --prefix=functions test
```

Great, 1 test passed, 3 more to go.

## Let users read, update and delete their carts

The next test covers the case of a cart owner having the ability to read, update, or delete their cart.

1. Open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_3">firestore.rules_template_3</walkthrough-editor-open-file>. 

2. Now **review** and **edit** the template to add to the ```allow``` statement:

* Review the notes about this addition <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_3" startLine=13 startCharacterOffset=0 endLine=21 endCharacterOffset=0>here</walkthrough-editor-select-line>.

* And then edit <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_3" startLine=21 startCharacterOffset=0 endLine=24 endCharacterOffset=0>here</walkthrough-editor-select-line>.

3. **Copy** the modified and **saved** firestore.rules_template_3 file to update ```firestore.rules```.
```bash
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_3 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```

4.  Run the tests.
```bash
npm --prefix=functions test
```

There we go. Now 2 passing tests.

## Let users put items in their cart

Empty carts are no good. Let's write a new set of ```match``` and ```allow``` statements so users can add items to their carts as as long as they own the cart.

1. Open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_4">firestore.rules_template_4</walkthrough-editor-open-file>. 

2. Now **review** and **edit** the template to add new rule statements:

* Review the notes about this addition <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_4" startLine=15 startCharacterOffset=0 endLine=24 endCharacterOffset=0>here</walkthrough-editor-select-line>.

* And then edit <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_4" startLine=24 startCharacterOffset=0 endLine=31 endCharacterOffset=0>here</walkthrough-editor-select-line>.

3. **Copy** the modified and **saved** firestore.rules_template_4 file to update ```firestore.rules```.
```bash
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_4 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```

4.  Run the tests.
```bash
npm --prefix=functions test
```

Almost there. Let's adjust the rules for our final test case.

## Let users view items in their cart

Last but not least, users should be able to view ```items```.

1. Open <walkthrough-editor-open-file filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_5">firestore.rules_template_5</walkthrough-editor-open-file>. 

2. Now **review** and **edit** the template to add new rule statements:

* Edit <walkthrough-editor-select-line filePath="./rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_5" startLine=16 startCharacterOffset=0 endLine=17 endCharacterOffset=0>here</walkthrough-editor-select-line>.

3. **Copy** the modified and **saved** firestore.rules_template_5 file to update ```firestore.rules```.
```bash
cp ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/rules-examples/firestore.rules_template_5 \
   ~/rules-tutorial/quickstart-nodejs/cs-walkthrough/firestore.rules
```

4.  Run the tests again, and notice the first error.
```bash
npm --prefix=functions test
```
Fantastic! 4 security test cases, 4 passing tests!

With the Local Emulator Suite and Firebase Test SDK, right in Cloud Shell with pre-installed tools, we've been able to prototype a set of Security Rules and test their performance without touching production code.


## What next?

OK, so we've:

+   Created a Firestore database using Firebase Local Emulator Suite, populated this database, and used it for live Security Rules evaluations.
+   Worked with a .rules file and a few predefined test cases using Firebase Test SDK to spot buggy Security Rules and quickly iterate fixes

At this point, we recommend you:

+   Learn more about Firebase Local Emulator Suite, including how to install and include it in your continuous integration environment, as well as how to use it for mobile app prototyping and testing. These topics [are covered in the documentation](https://firebase.google.com/docs/emulator-suite).
+   Compare this experience of debugging Security Rules with the Emulator Suite to the experience of Rules debugging in the Security Rules Simulator. Each tool has its value. You can find the Simulator in the [Rules tab in Firebase console](https://firebase.corp.google.com/project/_/database/firestore/rules).

**The Firebase console is likely still open in your browser. To complete this walkthrough and close Cloud Shell, simply close this browser tab.**

Remember, you can always return to Cloud Shell to check out and prototype your Firebase Security Rules and other project files and data.
