# Test Security Rules with Firebase Emulators and Cloud Shell

## Introduction

Hi Firebase Security Rules developer! Welcome to Google Cloud Shell and Learning Assistant. We'll explain what this environment is all about shortly, but for now a quick orientation:

+   The panel you're reading this text in is called the Learning Assistant.
+   At left, the bottom panel is a full-featured command shell, essentially a Google-hosted virtual machine with Web interface, called the Google Cloud Shell.
+   At left, a file browser and editor panel let you browse directories in this Cloud Shell instance and edit local files.

You're likely here by way of the Rules interface in Firebase console,
interested in learning how you can use offline Firebase emulators to prototype
and test Security Rules for your Firebase project.

The news is good. This Cloud Shell instance is already configured with Firebase emulators and a simple testing framework designed with Security Rules development in mind.

Note: If you close this Learning Assistant panel by accident, at the Cloud Shell prompt, run `tutorial.sh`. You'll be prompted to resume the tutorial from where you left off.

To get started with the walkthrough...well, click `Start` below.

## What should you know for this walkthrough?

To get the most out of this Firebase emulators and Security Rules walkthrough, it's best if you've already implemented part or all of an app using a Firestore backend, or at least you should:

+   Be familiar with Firestore's overall NoSQL, document-centric concept of data
+   Be familiar with Firestore's particular document and collection representation of data
+   Have looked at the Firestore default rules set, `firestore.rules,` in your own project
+   Have a Github account

In other words, we hope you'll be familiar with the basics of Firestore security and ready for next steps. If you're just starting out or need a refresher, link XXX.

## What will you learn in this walkthrough?

We're hoping this walkthrough will teach you how to quickly access the Firebase Local Emulator Suite in a Cloud Shell environment, a **persistent** environment that you can drop back into whenever you need to debug Security Rules and don't have access to your own locally-installed Emulator Suite. In this case, the Firestore emulator is preconfigured, with Security Rules engine built-in.

We also want to introduce the Firebase Test SDK, a Node.js plus mocha framework that is well-suited for prototyping and debugging Security Rules. Don't worry:

+   Running tests with Node.js and mocha is straightforward. Kicking off tests is a one-liner operation: `npm run test`.
+   We focus on Firebase emulators and Security Rules, not details of test frameworks that would distract from the lessons you're trying to learn.
+   We'll glance at but won't need to edit any test script. Instead, we'll concentrate on a  `firestore.rules` file, looking at rules statements that fail and iterating until rules operate the way you need them to.

After working with the Firestore and Security Rules emulator, you'll be able to initialize your Firebase project here in Cloud Shell and continue working on your own project's Security Rules.

OK, now let's get started with a bit about this Cloud Shell environment!

## Getting familiar with Cloud Shell

+   A VM, a persistent, hosted environment
+   (Sell Cloud Shell as prototyping and learning environment)

    +   Net access, git access

+   We've pre-installed the Firestore emulator

    +   Lets you test with Firestore without touching any production code or data, and, important in this context, its Security Rules using the Firestore API 
    +   Also the Firebase Test SDK

## Check out a Security Rules tutorial project

(These will all be Neos "terminal input code blocks" to dump to promptâ€¦)

1.  Set up a directory structure to organize tutorial project files plus your own project(s).

> Note: Please create the following directory from the **root** of your Cloud Shell home directory. Once this walkthrough is done, you can remove the tutorial directory and re-organize your Cloud Shell working directory however you like.  
```bash
cd ~; mkdir rules-tutorial
```

1.  Switch to the tutorial working directory.

```bash
cd ~/rules-tutorial
```

1.  Check out the tutorial project from Github.

```bash
git clone https://github.com/firebase/quickstart-nodejs  
```

1.  Install the Firebase Test SDK and a few more tools.

```bash
npm install
```

1.  Confirm the checkout was successful by running tests using the default test cases and Security Rules configuration

```bash
npm run test
```

## Using the Learning Assistant

This Learning Assistant has some convenient features we'll take advantage of for this walkthrough. Let's try them out.

Note: Be sure you've followed the previous topic and created the home directory structure explained there.

1.  You'll be opening files. Click to open <walkthrough-editor-open-file filePath="./firestore.rules">a sample firebase.rules file</walkthrough-editor-open-file>.
1.  In those files, you'll read notes and instructions in code comments and make edits. Click to select <walkthrough-editor-select-line filePath="./firestore.rules" startLine=0 startCharacterOffset=0 endLine=4 endCharacterOffset=0>some introductory notes</walkthrough-editor-select-line>
1.  You'll run commands at the Cloud Shell prompt.

```bash
npm run test
```
We'll present most of the walkthrough content and hands-on exercises this way, so get comfortable with this interaction.

## Security Rules basics

(Note: break up basic concepts into sections and link out to specific Firesite topics, don't dump them into the top level of Rules docs)

+   (Working with .rules files)
+   Rules basic syntax
+   Checking rules evaluations
+   What closed rules look like...

## Broken rules are good (for offline learning)

+   Try: opening a series of consecutive tutorial rules files (firestore.rules, firestore.rules.1, firestore.rules.2) and Save Asâ€¦ firestore.rules to run tests...
+   Introduce our use case
+   Look at the Firestore data we're securing

    +   (go to editor I/F, open test.js in editor panel)
    +   With Test SDK we're setting up a local, emulated Firestore database with data model in this file.

        +   This gives you the freedom to iterate both your rules and your data model. Adjustments to both are often necessary to get security working the way you need it to
        +   Let's quickly review the data model (shift focus to editor window and code comments)
        +   Come back to this panel when you're done in test.js

+   Now look at the initial rules

    +   (go to editor I/Fopen firestore.rules in editor panel)
    +   What do you predict?

+   Now let's watch it burn  `npm run test`

    +   Match expectations?
    +   Rules failed here becauseâ€¦.

## Repaired rules are better (for production)

## Initialize your Firebase project and continue with your own project's Security Rules

+   Ugh, we have to right?
+   When finished, `firebase deploy` to push your modified project files back to production.

## What next?

OK, so we've:

+   Created a Firestore database using Firebase Local Emulator Suite, populated
this database, and used it for live Security Rules evaluations. +   Worked with
a .rules file and a few predefined test cases using Firebase Test SDK to spot
buggy Security Rules and quickly iterate fixes +   Pushed updated Firebase
project files to production from the Cloud Shell

At this point, we recommend you:

+   Learn more about Firebase Local Emulator Suite, including how to install and include it in your continuous integration environment, as well as how to use it for mobile app prototyping and testing.

The Firebase console is likely still open in your browser. To complete this walkthrough and close Cloud Shell, simply close this browser tab. If you deployed your updated Security Rules, refresh the console Rules Simulator to see the updates. Remember, you can always return to Cloud Shell and continue with your Security Rules and other project files and data.
