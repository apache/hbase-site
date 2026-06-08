import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let c=`## Branches

We use Git for source code management and latest development happens on \`master\` branch. There are
branches for past major/minor/maintenance releases and important features and bug fixes are often
back-ported to them.

## Policy for Fix Version in JIRA

To determine if a given fix is in a given release purely from the release numbers following rules
are defined:

Fix version of X.Y.Z => fixed in all releases X.Y.Z' (where Z' = Z).\\
Fix version of X.Y.0 => fixed in all releases X.Y'.\\* (where Y' = Y).\\
Fix version of X.0.0 => fixed in all releases X'.\\*.\\* (where X' = X).

By this policy, fix version of 1.3.0 implies 1.4.0, but 1.3.2 does not imply 1.4.0 as we could not
tell purely from the numbers which release came first.

## Code Standards

### Interface Classifications

Interfaces are classified both by audience and by stability level.
These labels appear at the head of a class.
The conventions followed by HBase are inherited by its parent project, Hadoop.

The following interface classifications are commonly used:

#### InterfaceAudience

\`@InterfaceAudience.Public\`\\
APIs for users and HBase applications.
These APIs will be deprecated through major versions of HBase.

\`@InterfaceAudience.Private\`\\
APIs for HBase internals developers.
No guarantees on compatibility or availability in future versions.
Private interfaces do not need an \`@InterfaceStability\` classification.

\`@InterfaceAudience.LimitedPrivate(HBaseInterfaceAudience.COPROC)\`\\
APIs for HBase coprocessor writers.

**No \`@InterfaceAudience\` Classification**:\\
Packages without an \`@InterfaceAudience\` label are considered private.
Mark your new packages if publicly accessible.

<Callout type="info" title="Excluding Non-Public Interfaces from API Documentation">
  Only interfaces classified \`@InterfaceAudience.Public\` should be included in API documentation
  (Javadoc). Committers must add new package excludes \`ExcludePackageNames\` section of the *pom.xml*
  for new packages which do not contain public classes.
</Callout>

#### @InterfaceStability

\`@InterfaceStability\` is important for packages marked \`@InterfaceAudience.Public\`.

\`@InterfaceStability.Stable\`\\
Public packages marked as stable cannot be changed without a deprecation path or a very good reason.

\`@InterfaceStability.Unstable\`\\
Public packages marked as unstable can be changed without a deprecation path.

\`@InterfaceStability.Evolving\`\\
Public packages marked as evolving may be changed, but it is discouraged.

**No \`@InterfaceStability\` Label**:
Public classes with no \`@InterfaceStability\` label are discouraged, and should be considered implicitly unstable.

If you are unclear about how to mark packages, ask on the development list.

### Code Formatting Conventions

Please adhere to the following guidelines so that your patches can be reviewed more quickly.
These guidelines have been developed based upon common feedback on patches from new contributors.

See the [Code Conventions for the Java Programming Language](http://www.oracle.com/technetwork/java/index-135089.html) for more information on coding conventions in Java.
See [Eclipse Code Formatting](/docs/building-and-developing#code-formatting) to setup Eclipse to check for some of
these guidelines automatically.

#### Space Invaders

Do not use extra spaces around brackets.
Use the second style, rather than the first.

\`\`\`java
if ( foo.equals( bar ) ) {     // don't do this
\`\`\`

\`\`\`java
if (foo.equals(bar)) {
\`\`\`

\`\`\`java
foo = barArray[ i ];     // don't do this
\`\`\`

\`\`\`java
foo = barArray[i];
\`\`\`

#### Auto Generated Code

Auto-generated code in Eclipse often uses bad variable names such as \`arg0\`.
Use more informative variable names.
Use code like the second example here.

\`\`\`java
 public void readFields(DataInput arg0) throws IOException {    // don't do this
   foo = arg0.readUTF();                                       // don't do this
\`\`\`

\`\`\`java
 public void readFields(DataInput di) throws IOException {
   foo = di.readUTF();
\`\`\`

#### Long Lines

Keep lines less than 100 characters.
You can configure your IDE to do this automatically.

\`\`\`java
Bar bar = foo.veryLongMethodWithManyArguments(argument1, argument2, argument3, argument4, argument5, argument6, argument7, argument8, argument9);  // don't do this
\`\`\`

\`\`\`java
Bar bar = foo.veryLongMethodWithManyArguments(
 argument1, argument2, argument3,argument4, argument5, argument6, argument7, argument8, argument9);
\`\`\`

#### Trailing Spaces

Be sure there is a line break after the end of your code, and avoid lines with nothing but whitespace.
This makes diffs more meaningful.
You can configure your IDE to help with this.

\`\`\`java
Bar bar = foo.getBar();     <--- imagine there is an extra space(s) after the semicolon.
\`\`\`

#### API Documentation (Javadoc)

Don't forget Javadoc!

Javadoc warnings are checked during precommit.
If the precommit tool gives you a '-1', please fix the javadoc issue.
Your patch won't be committed if it adds such warnings.

Also, no \`@author\` tags - that's a rule.

#### Findbugs

\`Findbugs\` is used to detect common bugs pattern.
It is checked during the precommit build.
If errors are found, please fix them.
You can run findbugs locally with \`mvn
                            findbugs:findbugs\`, which will generate the \`findbugs\` files locally.
Sometimes, you may have to write code smarter than \`findbugs\`.
You can annotate your code to tell \`findbugs\` you know what you're doing, by annotating your class with the following annotation:

\`\`\`java
@edu.umd.cs.findbugs.annotations.SuppressWarnings(
value="HE_EQUALS_USE_HASHCODE",
justification="I know what I'm doing")
\`\`\`

It is important to use the Apache-licensed version of the annotations. That generally means using
annotations in the \`edu.umd.cs.findbugs.annotations\` package so that we can rely on the cleanroom
reimplementation rather than annotations in the \`javax.annotations\` package.

#### Javadoc - Useless Defaults

Don't just leave javadoc tags the way IDE generates them, or fill redundant information in them.

\`\`\`java
  /**
   * @param table                              <---- don't leave them empty!
   * @param region An HRegion object.          <---- don't fill redundant information!
   * @return Foo Object foo just created.      <---- Not useful information
   * @throws SomeException                     <---- Not useful. Function declarations already tell that!
   * @throws BarException when something went wrong  <---- really?
   */
  public Foo createFoo(Bar bar);
\`\`\`

Either add something descriptive to the tags, or just remove them.
The preference is to add something descriptive and useful.

#### One Thing At A Time, Folks

If you submit a patch for one thing, don't do auto-reformatting or unrelated reformatting of code on a completely different area of code.

Likewise, don't add unrelated cleanup or refactorings outside the scope of your Jira.

#### Ambiguous Unit Tests

Make sure that you're clear about what you are testing in your unit tests and why.

### Garbage-Collection Conserving Guidelines

The following guidelines were borrowed from [http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage](http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage).
Keep them in mind to keep preventable garbage collection to a minimum. Have a look
at the blog post for some great examples of how to refactor your code according to
these guidelines.

* Be careful with Iterators
* Estimate the size of a collection when initializing
* Defer expression evaluation
* Compile the regex patterns in advance
* Cache it if you can
* String Interns are useful but dangerous

## Invariants

We don't have many but what we have we list below.
All are subject to challenge of course but until then, please hold to the rules of the road.

### No permanent state in ZooKeeper

ZooKeeper state should transient (treat it like memory). If ZooKeeper state is deleted, hbase should be able to recover and essentially be in the same state.

* .Exceptions: There are currently a few exceptions that we need to fix around whether a table is enabled or disabled.
* Replication data is currently stored only in ZooKeeper.
  Deleting ZooKeeper data related to replication may cause replication to be disabled.
  Do not delete the replication tree, */hbase/replication/*.

<Callout type="warning">
  Replication may be disrupted and data loss may occur if you delete the replication tree
  (*/hbase/replication/*) from ZooKeeper. Follow progress on this issue at
  [HBASE-10295](https://issues.apache.org/jira/browse/HBASE-10295).
</Callout>

## Running In-Situ

If you are developing Apache HBase, frequently it is useful to test your changes against a more-real cluster than what you find in unit tests.
In this case, HBase can be run directly from the source in local-mode.
All you need to do is run:

\`\`\`bash
\${HBASE_HOME}/bin/start-hbase.sh
\`\`\`

This will spin up a full local-cluster, just as if you had packaged up HBase and installed it on your machine.

Keep in mind that you will need to have installed HBase into your local maven repository for the in-situ cluster to work properly.
That is, you will need to run:

\`\`\`bash
mvn clean install -DskipTests
\`\`\`

to ensure that maven can find the correct classpath and dependencies.
Generally, the above command is just a good thing to try running first, if maven is acting oddly.

## Adding Metrics

After adding a new feature a developer might want to add metrics.
HBase exposes metrics using the Hadoop Metrics 2 system, so adding a new metric involves exposing that metric to the hadoop system.
Unfortunately the API of metrics2 changed from hadoop 1 to hadoop 2.
In order to get around this a set of interfaces and implementations have to be loaded at runtime.
To get an in-depth look at the reasoning and structure of these classes you can read the blog post located [here](https://blogs.apache.org/hbase/entry/migration_to_the_new_metrics).
To add a metric to an existing MBean follow the short guide below:

### Add Metric name and Function to Hadoop Compat Interface.

Inside of the source interface the corresponds to where the metrics are generated (eg MetricsMasterSource for things coming from HMaster) create new static strings for metric name and description.
Then add a new method that will be called to add new reading.

### Add the Implementation to Both Hadoop 1 and Hadoop 2 Compat modules.

Inside of the implementation of the source (eg.
MetricsMasterSourceImpl in the above example) create a new histogram, counter, gauge, or stat in the init method.
Then in the method that was added to the interface wire up the parameter passed in to the histogram.

Now add tests that make sure the data is correctly exported to the metrics 2 system.
For this the MetricsAssertHelper is provided.

## Git Best Practices

**Avoid git merges.**\\
Use \`git pull --rebase\` or \`git fetch\` followed by \`git rebase\`.

**Do not use \`git push --force\`.**\\
If the push does not work, fix the problem or ask for help.

Please contribute to this document if you think of other Git best practices.

### \`rebase_all_git_branches.sh\`

The *dev-support/rebase\\_all\\_git\\_branches.sh* script is provided to help keep your Git repository clean.
Use the \`-h\` parameter to get usage instructions.
The script automatically refreshes your tracking branches, attempts an automatic rebase of each local branch against its remote branch, and gives you the option to delete any branch which represents a closed \`HBASE-\` JIRA.
The script has one optional configuration option, the location of your Git directory.
You can set a default by editing the script.
Otherwise, you can pass the git directory manually by using the \`-d\` parameter, followed by an absolute or relative directory name, or even '.' for the current working directory.
The script checks the directory for sub-directory called *.git/*, before proceeding.

## Submitting Patches

If you are new to submitting patches to open source or new to submitting patches to Apache, start by
reading the [On Contributing Patches](https://commons.apache.org/patches.html) page from
[Apache Commons Project](https://commons.apache.org/).
It provides a nice overview that applies equally to the Apache HBase Project.

Make sure you review [Code Formatting Conventions](/docs/building-and-developing/developer-guidelines#code-formatting-conventions) for code style. If your patch
was generated incorrectly or your code does not adhere to the code formatting guidelines, you may
be asked to redo some work.

HBase enforces code style via a maven plugin. After you've written up your changes, apply the
formatter before committing.

\`\`\`bash
$ mvn spotless:apply
\`\`\`

When your commit is ready, present it to the community as a
[GitHub Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

### Few general guidelines

* Always patch against the master branch first, even if you want to patch in another branch.
  HBase committers always apply patches first to the master branch, and backport as necessary. For
  complex patches, you may be asked to perform the backport(s) yourself.
* Submit one single PR for a single fix. If necessary, squash local commits to merge local commits
  into a single one first. See this
  [Stack Overflow
  question](http://stackoverflow.com/questions/5308816/how-to-use-git-merge-squash) for more information about squashing commits.
* Please understand that not every patch may get committed, and that feedback will likely be
  provided on the patch.

### Unit Tests

Always add and/or update relevant unit tests when making the changes.
Make sure that new/changed unit tests pass locally before submitting the patch because it is faster
than waiting for presubmit result which runs full test suite. This will save your own time and
effort.
Use [Mockito](https://site.mockito.org/) to make mocks which are very useful for testing failure scenarios by
injecting appropriate failures.

If you are creating a new unit test class, notice how other unit test classes have
classification/sizing annotations before class name and a static methods for setup/teardown of
testing environment. Be sure to include annotations in any new unit test files.
See [Tests](/docs/building-and-developing/tests) for more information on tests.

### Integration Tests

Significant new features should provide an integration test in addition to unit tests, suitable for exercising the new feature at different points in its configuration space.

### ReviewBoard

Patches larger than one screen, or patches that will be tricky to review, should go through [ReviewBoard](https://reviews.apache.org).

**Procedure: Use ReviewBoard**

<Steps>
  <Step>
    Register for an account if you don't already have one.
    It does not use the credentials from [issues.apache.org](https://issues.apache.org).
    Log in.
  </Step>

  <Step>
    Click **New Review Request**.
  </Step>

  <Step>
    Choose the \`hbase-git\` repository.
    Click Choose File to select the diff and optionally a parent diff.
    Click **Create Review Request**.
  </Step>

  <Step>
    Fill in the fields as required.
    At the minimum, fill in the **Summary** and choose \`hbase\` as the **Review Group**.
    If you fill in the **Bugs** field, the review board links back to the relevant JIRA.
    The more fields you fill in, the better.
    Click **Publish** to make your review request public.
    An email will be sent to everyone in the \`hbase\` group, to review the patch.
  </Step>

  <Step>
    Back in your JIRA, click , and paste in the URL of your ReviewBoard request.
    This attaches the ReviewBoard to the JIRA, for easy access.
  </Step>

  <Step>
    To cancel the request, click .
  </Step>
</Steps>

For more information on how to use ReviewBoard, see [the ReviewBoard
documentation](http://www.reviewboard.org/docs/manual/1.5/).

### GitHub

Submitting [GitHub](https://github.com/apache/hbase) pull requests is another accepted form of
contributing patches. Refer to GitHub [documentation](https://help.github.com/) for details on
how to create pull requests.

<Callout type="info">
  This section is incomplete and needs to be updated. Refer to
  [HBASE-23557](https://issues.apache.org/jira/browse/HBASE-23557)
</Callout>

#### GitHub Tooling

**Browser bookmarks**

Following is a useful javascript based browser bookmark that redirects from GitHub pull
requests to the corresponding jira work item. This redirects based on the HBase jira ID mentioned
in the issue title for the PR. Add the following javascript snippet as a browser bookmark to the
tool bar. Clicking on it while you are on an HBase GitHub PR page redirects you to the corresponding
jira item.

\`\`\`js
location.href =
  "https://issues.apache.org/jira/browse/" +
  document.getElementsByClassName("js-issue-title")[0].innerHTML.match(/HBASE-\\d+/)[0];
\`\`\`

### Guide for HBase Committers

#### Becoming a committer

Committers are responsible for reviewing and integrating code changes, testing
and voting on release candidates, weighing in on design discussions, as well as
other types of project contributions. The PMC votes to make a contributor a
committer based on an assessment of their contributions to the project. It is
expected that committers demonstrate a sustained history of high-quality
contributions to the project and community involvement.

Contributions can be made in many ways. There is no single path to becoming a
committer, nor any expected timeline. Submitting features, improvements, and bug
fixes is the most common avenue, but other methods are both recognized and
encouraged (and may be even more important to the health of HBase as a project and a
community). A non-exhaustive list of potential contributions (in no particular
order):

* [Update the documentation](/docs/contributing-to-documentation) for new
  changes, best practices, recipes, and other improvements.
* Keep the website up to date.
* Perform testing and report the results. For instance, scale testing and
  testing non-standard configurations is always appreciated.
* Maintain the shared Jenkins testing environment and other testing
  infrastructure.
* [Vote on release candidates](/docs/building-and-developing/voting) after performing validation, even if non-binding.
  A non-binding vote is a vote by a non-committer.
* Provide input for discussion threads on the link:/mail-lists.html\\[mailing lists] (which usually have
  \`[DISCUSS]\` in the subject line).
* Answer questions questions on the user or developer mailing lists and on
  Slack.
* Make sure the HBase community is a welcoming one and that we adhere to our
  link:/coc.html\\[Code of conduct]. Alert the PMC if you
  have concerns.
* Review other people's work (both code and non-code) and provide public
  feedback.
* Report bugs that are found, or file new feature requests.
* Triage issues and keep JIRA organized. This includes closing stale issues,
  labeling new issues, updating metadata, and other tasks as needed.
* Mentor new contributors of all sorts.
* Give talks and write blogs about HBase. Add these to the link:/\\[News] section
  of the website.
* Provide UX feedback about HBase, the web UI, the CLI, APIs, and the website.
* Write demo applications and scripts.
* Help attract and retain a diverse community.
* Interact with other projects in ways that benefit HBase and those other
  projects.

Not every individual is able to do all (or even any) of the items on this list.
If you think of other ways to contribute, go for it (and add them to the list).
A pleasant demeanor and willingness to contribute are all you need to make a
positive impact on the HBase project. Invitations to become a committer are the
result of steady interaction with the community over the long term, which builds
trust and recognition.

#### New committers

New committers are encouraged to first read Apache's generic committer
documentation:

* [Apache New Committer Guide](https://www.apache.org/dev/new-committers-guide.html)
* [Apache Committer FAQ](https://www.apache.org/dev/committers.html)

#### Review

HBase committers should, as often as possible, attempt to review patches
submitted by others. Ideally every submitted patch will get reviewed by a
committer *within a few days*. If a committer reviews a patch they have not
authored, and believe it to be of sufficient quality, then they can commit the
patch. Otherwise the patch should be cancelled with a clear explanation for why
it was rejected.

The list of submitted patches is in the
[HBase Review Queue](https://issues.apache.org/jira/secure/IssueNavigator.jspa?mode=hide\\&requestId=12312392),
which is ordered by time of last modification. Committers should scan the list
from top to bottom, looking for patches that they feel qualified to review and
possibly commit. If you see a patch you think someone else is better qualified
to review, you can mention them by username in the JIRA.

For non-trivial changes, it is required that another committer review your
patches before commit. **Self-commits of non-trivial patches are not allowed.**
Use the **Submit Patch** button in JIRA, just like other contributors, and
then wait for a \`+1\` response from another committer before committing.

#### Reject

Patches which do not adhere to the guidelines in
[HowToContribute](/docs/building-and-developing) and to the
[code review checklist](https://cwiki.apache.org/confluence/display/HADOOP2/CodeReviewChecklist)
should be rejected. Committers should always be polite to contributors and try
to instruct and encourage them to contribute better patches. If a committer
wishes to improve an unacceptable patch, then it should first be rejected, and a
new patch should be attached by the committer for further review.

#### Commit

Committers commit patches to the Apache HBase GIT repository.

<Callout type="warn" title="Before you commit!!!!">
  Make sure your local configuration is correct, especially your identity and email. Examine the
  output of the \`$ git config --list\` command and be sure it is correct. See [Set Up
  Git](https://help.github.com/articles/set-up-git) if you need pointers.
</Callout>

When you commit a patch:

1. Include the Jira issue ID in the commit message along with a short description
   of the change. Try to add something more than just the Jira title so that
   someone looking at \`git log\` output doesn't have to go to Jira to discern what
   the change is about. Be sure to get the issue ID right, because this causes
   Jira to link to the change in Git (use the issue's "All" tab to see these
   automatic links).

2. Commit the patch to a new branch based off \`master\` or the other intended
   branch. It's a good idea to include the JIRA ID in the name of this branch.
   Check out the relevant target branch where you want to commit, and make sure
   your local branch has all remote changes, by doing a \`git pull --rebase\` or
   another similar command. Next, cherry-pick the change into each relevant
   branch (such as master), and push the changes to the remote branch using
   a command such as \`git push <remote-server> <remote-branch>\`.

   <Callout type="warning">
     If you do not have all remote changes, the push will fail. If the push fails for any reason,
     fix the problem or ask for help. Do not do a \`git push --force\`.
   </Callout>

   Before you can commit a patch, you need to determine how the patch was created.
   The instructions and preferences around the way to create patches have changed,
   and there will be a transition period.

   **Determine How a Patch Was Created**

   * If the first few lines of the patch look like the headers of an email, with a From, Date, and
     Subject, it was created using \`git format-patch\`. This is the preferred way, because you can
     reuse the submitter's commit message. If the commit message is not appropriate, you can still use
     the commit, then run \`git commit --amend\` and reword as appropriate.

   * If the first line of the patch looks similar to the following, it was created using +git diff+ without \`--no-prefix\`.
     This is acceptable too.
     Notice the \`a\` and \`b\` in front of the file names.
     This is the indication that the patch was not created with \`--no-prefix\`.

     \`\`\`diff
     diff --git a/src/main/asciidoc/_chapters/developer.adoc b/src/main/asciidoc/_chapters/developer.adoc
     \`\`\`

   * If the first line of the patch looks similar to the following (without the \`a\` and \`b\`), the
     patch was created with \`git diff --no-prefix\` and you need to add \`-p0\` to the \`git apply\` command
     below.

     \`\`\`diff
     diff --git src/main/asciidoc/_chapters/developer.adoc src/main/asciidoc/_chapters/developer.adoc
     \`\`\`

   **Example of committing a Patch**

   One thing you will notice with these examples is that there are a lot of
   \`git pull\` commands. The only command that actually writes anything to the
   remote repository is \`git push\`, and you need to make absolutely sure you have
   the correct versions of everything and don't have any conflicts before pushing.
   The extra \`git pull\` commands are usually redundant, but better safe than sorry.

   The first example shows how to apply a patch that was generated with +git
   format-patch+ and apply it to the \`master\` and \`branch-1\` branches.

   The directive to use \`git format-patch\` rather than \`git diff\`, and not to use
   \`--no-prefix\`, is a new one. See the second example for how to apply a patch
   created with \`git diff\`, and educate the person who created the patch.

   \`\`\`bash
   $ git checkout -b HBASE-XXXX
   $ git am ~/Downloads/HBASE-XXXX-v2.patch --signoff  # If you are committing someone else's patch.
   $ git checkout master
   $ git pull --rebase
   $ git cherry-pick <sha-from-commit>
   # Resolve conflicts if necessary or ask the submitter to do it
   $ git pull --rebase          # Better safe than sorry
   $ git push origin master

   # Backport to branch-1
   $ git checkout branch-1
   $ git pull --rebase
   $ git cherry-pick <sha-from-commit>
   # Resolve conflicts if necessary
   $ git pull --rebase          # Better safe than sorry
   $ git push origin branch-1
   $ git branch -D HBASE-XXXX
   \`\`\`

   This example shows how to commit a patch that was created using \`git diff\`
   without \`--no-prefix\`. If the patch was created with \`--no-prefix\`, add \`-p0\` to
   the \`git apply\` command.

   \`\`\`bash
   $ git apply ~/Downloads/HBASE-XXXX-v2.patch
   $ git commit -m "HBASE-XXXX Really Good Code Fix (Joe Schmo)" --author=<contributor> -a  # This and next command is needed for patches created with 'git diff'
   $ git commit --amend --signoff
   $ git checkout master
   $ git pull --rebase
   $ git cherry-pick <sha-from-commit>
   # Resolve conflicts if necessary or ask the submitter to do it
   $ git pull --rebase          # Better safe than sorry
   $ git push origin master

   # Backport to branch-1
   $ git checkout branch-1
   $ git pull --rebase
   $ git cherry-pick <sha-from-commit>
   # Resolve conflicts if necessary or ask the submitter to do it
   $ git pull --rebase           # Better safe than sorry
   $ git push origin branch-1
   $ git branch -D HBASE-XXXX
   \`\`\`

3. Resolve the issue as fixed, thanking the contributor.
   Always set the "Fix Version" at this point, but only set a single fix version
   for each branch where the change was committed, the earliest release in that
   branch in which the change will appear.

**Commit Message Format**

The commit message should contain the JIRA ID and a description of what the patch does.
The preferred commit message format is:

\`\`\`text
<jira-id> <jira-title> (<contributor-name-if-not-commit-author>)
\`\`\`

\`\`\`text
HBASE-12345 Fix All The Things (jane@example.com)
\`\`\`

If the contributor used \`git format-patch\` to generate the patch, their commit
message is in their patch and you can use that, but be sure the JIRA ID is at
the front of the commit message, even if the contributor left it out.

**Use GitHub's "Co-authored-by" when there are multiple authors**

We've established the practice of committing to master and then cherry picking back to branches whenever possible, unless

* it's breaking compat: In which case, if it can go in minor releases, backport to branch-1 and branch-2.
* it's a new feature: No for maintenance releases, For minor releases, discuss and arrive at consensus.

There are occasions when there are multiple author for a patch.
For example when there is a minor conflict we can fix it up and just proceed with the commit.
The amending author will be different from the original committer, so you should also attribute to the original author by
adding one or more \`Co-authored-by\` trailers to the commit's message.
See [the GitHub documentation for "Creating a commit with multiple authors"](https://help.github.com/en/articles/creating-a-commit-with-multiple-authors/).

In short, these are the steps to add Co-authors that will be tracked by GitHub:

1. Collect the name and email address for each co-author.
2. Commit the change, but after your commit description, instead of a closing quotation, add two empty lines. (Do not close the commit message with a quotation mark)
3. On the next line of the commit message, type \`Co-authored-by: name <name@example.com>\`. After the co-author information, add a closing quotation mark.

Here is the example from the GitHub page, using 2 Co-authors:

\`\`\`bash
$ git commit -m "Refactor usability tests.
>
>
Co-authored-by: name <name@example.com>
Co-authored-by: another-name <another-name@example.com>"
\`\`\`

Note: \`Amending-Author: Author <committer@apache>\` was used prior to this
[DISCUSSION](https://lists.apache.org/thread.html/f00b5f9b65570e777dbb31c37d7b0ffc55c5fc567aefdb456608a042@%3Cdev.hbase.apache.org%3E).

**Close related GitHub PRs**

As a project we work to ensure there's a JIRA associated with each change, but we don't mandate any particular tool be used for reviews. Due to implementation details of the ASF's integration between hosted git repositories and GitHub, the PMC has no ability to directly close PRs on our GitHub repo. In the event that a contributor makes a Pull Request on GitHub, either because the contributor finds that easier than attaching a patch to JIRA or because a reviewer prefers that UI for examining changes, it's important to make note of the PR in the commit that goes to the master branch so that PRs are kept up to date.

To read more about the details of what kinds of commit messages will work with the GitHub "close via keyword in commit" mechanism see [the GitHub documentation for "Closing issues using keywords"](https://help.github.com/articles/closing-issues-using-keywords/). In summary, you should include a line with the phrase "closes #XXX", where the XXX is the pull request id. The pull request id is usually given in the GitHub UI in grey at the end of the subject heading.

**Committers are responsible for making sure commits do not break the build or tests**

If a committer commits a patch, it is their responsibility to make sure it passes the test suite.
It is helpful if contributors keep an eye out that their patch does not break the hbase build and/or tests, but ultimately, a contributor cannot be expected to be aware of all the particular vagaries and interconnections that occur in a project like HBase.
A committer should.

**Patching Etiquette**

In the thread [HBase, mail # dev - ANNOUNCEMENT: Git Migration In Progress (WAS =>
Re: Git Migration)](https://lists.apache.org/thread.html/186fcd5eb71973a7b282ecdba41606d3d221efd505d533bb729e1fad%401400648690%40%3Cdev.hbase.apache.org%3E), it was agreed on the following patch flow

1. Develop and commit the patch against master first.
2. Try to cherry-pick the patch when backporting if possible.
3. If this does not work, manually commit the patch to the branch.

**Merge Commits**

Avoid merge commits, as they create problems in the git history.

**Committing Documentation**

See [appendix contributing to documentation](/docs/contributing-to-documentation).

**How to re-trigger github Pull Request checks/re-build**

A Pull Request (PR) submission triggers the hbase yetus checks. The checks make
sure the patch doesn't break the build or introduce test failures. The checks take
around four hours to run (They are the same set run when you submit a patch via
HBASE JIRA). When finished, they add a report to the PR as a comment. If a problem
w/ the patch — failed compile, checkstyle violation, or an added findbugs --
the original author makes fixes and pushes a new patch. This re-runs the checks
to produce a new report.

Sometimes though, the patch is good but a flakey, unrelated test has the report vote -1
on the patch. In this case, **committers** can retrigger the check run by doing a force push of the
exact same patch. Or, click on the \`Console output\` link which shows toward the end
of the report (For example \`https://builds.apache.org/job/HBase-PreCommit-GitHub-PR/job/PR-289/1/console\`).
This will take you to \`builds.apache.org\`, to the build run that failed. See the
"breadcrumbs" along the top (where breadcrumbs is the listing of the directories that
gets us to this particular build page). It'll look something like
\`Jenkins > HBase-PreCommit-GitHub-PR > PR-289 > #1\`. Click on the
PR number — i.e. PR-289 in our example — and then, when you've arrived at the PR page,
find the 'Build with Parameters' menu-item (along top left-hand menu). Click here and
then \`Build\` leaving the JIRA\\_ISSUE\\_KEY empty. This will re-run your checks.

### Dialog

Committers should hang out in the #hbase room on irc.freenode.net for real-time discussions.
However any substantive discussion (as with any off-list project-related discussion) should be re-iterated in Jira or on the developer list.

### Do not edit JIRA comments

Misspellings and/or bad grammar is preferable to the disruption a JIRA comment edit.

## The hbase-thirdparty dependency and shading/relocation

A new project was created for the release of hbase-2.0.0. It was called
\`hbase-thirdparty\`. This project exists only to provide the main hbase
project with relocated — or shaded — versions of popular thirdparty
libraries such as guava, netty, and protobuf. The mainline HBase project
relies on the relocated versions of these libraries gotten from hbase-thirdparty
rather than on finding these classes in their usual locations. We do this so
we can specify whatever the version we wish. If we don't relocate, we must
harmonize our version to match that which hadoop, spark, and other projects use.

For developers, this means you need to be careful referring to classes from
netty, guava, protobuf, gson, etc. (see the hbase-thirdparty pom.xml for what
it provides). Devs must refer to the hbase-thirdparty provided classes. In
practice, this is usually not an issue (though it can be a bit of a pain). You
will have to hunt for the relocated version of your particular class. You'll
find it by prepending the general relocation prefix of \`org.apache.hbase.thirdparty.\`.
For example if you are looking for \`com.google.protobuf.Message\`, the relocated
version used by HBase internals can be found at
\`org.apache.hbase.thirdparty.com.google.protobuf.Message\`.

For a few thirdparty libs, like protobuf (see the protobuf chapter in this book
for the why), your IDE may give you both options — the \`com.google.protobuf.*\`
and the \`org.apache.hbase.thirdparty.com.google.protobuf.*\` — because both
classes are on your CLASSPATH. Unless you are doing the particular juggling
required in Coprocessor Endpoint development (again see above cited protobuf
chapter), you'll want to use the shaded version, always.

The \`hbase-thirdparty\` project has groupid of \`org.apache.hbase.thirdparty\`.
As of this writing, it provides three jars; one for netty with an artifactid of
\`hbase-thirdparty-netty\`, one for protobuf at \`hbase-thirdparty-protobuf\` and then
a jar for all else — gson, guava — at \`hbase-thirdpaty-miscellaneous\`.

The hbase-thirdparty artifacts are a product produced by the Apache HBase
project under the aegis of the HBase Project Management Committee. Releases
are done via the usual voting project on the hbase dev mailing list. If issue
in the hbase-thirdparty, use the hbase JIRA and mailing lists to post notice.

## Development of HBase-related Maven archetypes

The development of HBase-related Maven archetypes was begun with
[HBASE-14876](https://issues.apache.org/jira/browse/HBASE-14876).
For an overview of the hbase-archetypes infrastructure and instructions
for developing new HBase-related Maven archetypes, please see
\`hbase/hbase-archetypes/README.md\`.
`,l={title:"Developer Guidelines",description:"Code standards, interface classifications, formatting conventions, Git best practices, and patch submission guidelines for HBase contributors."},d=[{href:"http://www.oracle.com/technetwork/java/index-135089.html"},{href:"/docs/building-and-developing#code-formatting"},{href:"http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage"},{href:"https://issues.apache.org/jira/browse/HBASE-10295"},{href:"https://blogs.apache.org/hbase/entry/migration_to_the_new_metrics"},{href:"https://commons.apache.org/patches.html"},{href:"https://commons.apache.org/"},{href:"/docs/building-and-developing/developer-guidelines#code-formatting-conventions"},{href:"https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"},{href:"http://stackoverflow.com/questions/5308816/how-to-use-git-merge-squash"},{href:"https://site.mockito.org/"},{href:"/docs/building-and-developing/tests"},{href:"https://reviews.apache.org"},{href:"https://issues.apache.org"},{href:"http://www.reviewboard.org/docs/manual/1.5/"},{href:"https://github.com/apache/hbase"},{href:"https://help.github.com/"},{href:"https://issues.apache.org/jira/browse/HBASE-23557"},{href:"/docs/contributing-to-documentation"},{href:"/docs/building-and-developing/voting"},{href:"https://www.apache.org/dev/new-committers-guide.html"},{href:"https://www.apache.org/dev/committers.html"},{href:"https://issues.apache.org/jira/secure/IssueNavigator.jspa?mode=hide&requestId=12312392"},{href:"/docs/building-and-developing"},{href:"https://cwiki.apache.org/confluence/display/HADOOP2/CodeReviewChecklist"},{href:"https://help.github.com/articles/set-up-git"},{href:"https://help.github.com/en/articles/creating-a-commit-with-multiple-authors/"},{href:"https://lists.apache.org/thread.html/f00b5f9b65570e777dbb31c37d7b0ffc55c5fc567aefdb456608a042@%3Cdev.hbase.apache.org%3E"},{href:"https://help.github.com/articles/closing-issues-using-keywords/"},{href:"https://lists.apache.org/thread.html/186fcd5eb71973a7b282ecdba41606d3d221efd505d533bb729e1fad%401400648690%40%3Cdev.hbase.apache.org%3E"},{href:"/docs/contributing-to-documentation"},{href:"https://issues.apache.org/jira/browse/HBASE-14876"}],u={contents:[{heading:"branches",content:`We use Git for source code management and latest development happens on master branch. There are
branches for past major/minor/maintenance releases and important features and bug fixes are often
back-ported to them.`},{heading:"policy-for-fix-version-in-jira",content:`To determine if a given fix is in a given release purely from the release numbers following rules
are defined:`},{heading:"policy-for-fix-version-in-jira",content:"Fix version of X.Y.Z => fixed in all releases X.Y.Z' (where Z' = Z).Fix version of X.Y.0 => fixed in all releases X.Y'.* (where Y' = Y).Fix version of X.0.0 => fixed in all releases X'.*.* (where X' = X)."},{heading:"policy-for-fix-version-in-jira",content:`By this policy, fix version of 1.3.0 implies 1.4.0, but 1.3.2 does not imply 1.4.0 as we could not
tell purely from the numbers which release came first.`},{heading:"interface-classifications",content:`Interfaces are classified both by audience and by stability level.
These labels appear at the head of a class.
The conventions followed by HBase are inherited by its parent project, Hadoop.`},{heading:"interface-classifications",content:"The following interface classifications are commonly used:"},{heading:"interfaceaudience",content:`@InterfaceAudience.PublicAPIs for users and HBase applications.
These APIs will be deprecated through major versions of HBase.`},{heading:"interfaceaudience",content:`@InterfaceAudience.PrivateAPIs for HBase internals developers.
No guarantees on compatibility or availability in future versions.
Private interfaces do not need an @InterfaceStability classification.`},{heading:"interfaceaudience",content:"@InterfaceAudience.LimitedPrivate(HBaseInterfaceAudience.COPROC)APIs for HBase coprocessor writers."},{heading:"interfaceaudience",content:`No @InterfaceAudience Classification:Packages without an @InterfaceAudience label are considered private.
Mark your new packages if publicly accessible.`},{heading:"interfaceaudience",content:"type: info"},{heading:"interfaceaudience",content:"title: Excluding Non-Public Interfaces from API Documentation"},{heading:"interfaceaudience",content:`Only interfaces classified @InterfaceAudience.Public should be included in API documentation
(Javadoc). Committers must add new package excludes ExcludePackageNames section of the pom.xml
for new packages which do not contain public classes.`},{heading:"interfacestability",content:"@InterfaceStability is important for packages marked @InterfaceAudience.Public."},{heading:"interfacestability",content:"@InterfaceStability.StablePublic packages marked as stable cannot be changed without a deprecation path or a very good reason."},{heading:"interfacestability",content:"@InterfaceStability.UnstablePublic packages marked as unstable can be changed without a deprecation path."},{heading:"interfacestability",content:"@InterfaceStability.EvolvingPublic packages marked as evolving may be changed, but it is discouraged."},{heading:"interfacestability",content:`No @InterfaceStability Label:
Public classes with no @InterfaceStability label are discouraged, and should be considered implicitly unstable.`},{heading:"interfacestability",content:"If you are unclear about how to mark packages, ask on the development list."},{heading:"code-formatting-conventions",content:`Please adhere to the following guidelines so that your patches can be reviewed more quickly.
These guidelines have been developed based upon common feedback on patches from new contributors.`},{heading:"code-formatting-conventions",content:`See the Code Conventions for the Java Programming Language for more information on coding conventions in Java.
See Eclipse Code Formatting to setup Eclipse to check for some of
these guidelines automatically.`},{heading:"space-invaders",content:`Do not use extra spaces around brackets.
Use the second style, rather than the first.`},{heading:"auto-generated-code",content:`Auto-generated code in Eclipse often uses bad variable names such as arg0.
Use more informative variable names.
Use code like the second example here.`},{heading:"long-lines",content:`Keep lines less than 100 characters.
You can configure your IDE to do this automatically.`},{heading:"trailing-spaces",content:`Be sure there is a line break after the end of your code, and avoid lines with nothing but whitespace.
This makes diffs more meaningful.
You can configure your IDE to help with this.`},{heading:"api-documentation-javadoc",content:"Don't forget Javadoc!"},{heading:"api-documentation-javadoc",content:`Javadoc warnings are checked during precommit.
If the precommit tool gives you a '-1', please fix the javadoc issue.
Your patch won't be committed if it adds such warnings.`},{heading:"api-documentation-javadoc",content:"Also, no @author tags - that's a rule."},{heading:"findbugs",content:`Findbugs is used to detect common bugs pattern.
It is checked during the precommit build.
If errors are found, please fix them.
You can run findbugs locally with mvn
                            findbugs:findbugs, which will generate the findbugs files locally.
Sometimes, you may have to write code smarter than findbugs.
You can annotate your code to tell findbugs you know what you're doing, by annotating your class with the following annotation:`},{heading:"findbugs",content:`It is important to use the Apache-licensed version of the annotations. That generally means using
annotations in the edu.umd.cs.findbugs.annotations package so that we can rely on the cleanroom
reimplementation rather than annotations in the javax.annotations package.`},{heading:"javadoc---useless-defaults",content:"Don't just leave javadoc tags the way IDE generates them, or fill redundant information in them."},{heading:"javadoc---useless-defaults",content:`Either add something descriptive to the tags, or just remove them.
The preference is to add something descriptive and useful.`},{heading:"one-thing-at-a-time-folks",content:"If you submit a patch for one thing, don't do auto-reformatting or unrelated reformatting of code on a completely different area of code."},{heading:"one-thing-at-a-time-folks",content:"Likewise, don't add unrelated cleanup or refactorings outside the scope of your Jira."},{heading:"ambiguous-unit-tests",content:"Make sure that you're clear about what you are testing in your unit tests and why."},{heading:"garbage-collection-conserving-guidelines",content:`The following guidelines were borrowed from http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage.
Keep them in mind to keep preventable garbage collection to a minimum. Have a look
at the blog post for some great examples of how to refactor your code according to
these guidelines.`},{heading:"garbage-collection-conserving-guidelines",content:"Be careful with Iterators"},{heading:"garbage-collection-conserving-guidelines",content:"Estimate the size of a collection when initializing"},{heading:"garbage-collection-conserving-guidelines",content:"Defer expression evaluation"},{heading:"garbage-collection-conserving-guidelines",content:"Compile the regex patterns in advance"},{heading:"garbage-collection-conserving-guidelines",content:"Cache it if you can"},{heading:"garbage-collection-conserving-guidelines",content:"String Interns are useful but dangerous"},{heading:"invariants",content:`We don't have many but what we have we list below.
All are subject to challenge of course but until then, please hold to the rules of the road.`},{heading:"no-permanent-state-in-zookeeper",content:"ZooKeeper state should transient (treat it like memory). If ZooKeeper state is deleted, hbase should be able to recover and essentially be in the same state."},{heading:"no-permanent-state-in-zookeeper",content:".Exceptions: There are currently a few exceptions that we need to fix around whether a table is enabled or disabled."},{heading:"no-permanent-state-in-zookeeper",content:`Replication data is currently stored only in ZooKeeper.
Deleting ZooKeeper data related to replication may cause replication to be disabled.
Do not delete the replication tree, /hbase/replication/.`},{heading:"no-permanent-state-in-zookeeper",content:"type: warning"},{heading:"no-permanent-state-in-zookeeper",content:`Replication may be disrupted and data loss may occur if you delete the replication tree
(/hbase/replication/) from ZooKeeper. Follow progress on this issue at
HBASE-10295.`},{heading:"running-in-situ",content:`If you are developing Apache HBase, frequently it is useful to test your changes against a more-real cluster than what you find in unit tests.
In this case, HBase can be run directly from the source in local-mode.
All you need to do is run:`},{heading:"running-in-situ",content:"This will spin up a full local-cluster, just as if you had packaged up HBase and installed it on your machine."},{heading:"running-in-situ",content:`Keep in mind that you will need to have installed HBase into your local maven repository for the in-situ cluster to work properly.
That is, you will need to run:`},{heading:"running-in-situ",content:`to ensure that maven can find the correct classpath and dependencies.
Generally, the above command is just a good thing to try running first, if maven is acting oddly.`},{heading:"adding-metrics",content:`After adding a new feature a developer might want to add metrics.
HBase exposes metrics using the Hadoop Metrics 2 system, so adding a new metric involves exposing that metric to the hadoop system.
Unfortunately the API of metrics2 changed from hadoop 1 to hadoop 2.
In order to get around this a set of interfaces and implementations have to be loaded at runtime.
To get an in-depth look at the reasoning and structure of these classes you can read the blog post located here.
To add a metric to an existing MBean follow the short guide below:`},{heading:"add-metric-name-and-function-to-hadoop-compat-interface",content:`Inside of the source interface the corresponds to where the metrics are generated (eg MetricsMasterSource for things coming from HMaster) create new static strings for metric name and description.
Then add a new method that will be called to add new reading.`},{heading:"add-the-implementation-to-both-hadoop-1-and-hadoop-2-compat-modules",content:`Inside of the implementation of the source (eg.
MetricsMasterSourceImpl in the above example) create a new histogram, counter, gauge, or stat in the init method.
Then in the method that was added to the interface wire up the parameter passed in to the histogram.`},{heading:"add-the-implementation-to-both-hadoop-1-and-hadoop-2-compat-modules",content:`Now add tests that make sure the data is correctly exported to the metrics 2 system.
For this the MetricsAssertHelper is provided.`},{heading:"git-best-practices",content:"Avoid git merges.Use git pull --rebase or git fetch followed by git rebase."},{heading:"git-best-practices",content:"Do not use git push --force.If the push does not work, fix the problem or ask for help."},{heading:"git-best-practices",content:"Please contribute to this document if you think of other Git best practices."},{heading:"rebase_all_git_branchessh",content:`The dev-support/rebase_all_git_branches.sh script is provided to help keep your Git repository clean.
Use the -h parameter to get usage instructions.
The script automatically refreshes your tracking branches, attempts an automatic rebase of each local branch against its remote branch, and gives you the option to delete any branch which represents a closed HBASE- JIRA.
The script has one optional configuration option, the location of your Git directory.
You can set a default by editing the script.
Otherwise, you can pass the git directory manually by using the -d parameter, followed by an absolute or relative directory name, or even '.' for the current working directory.
The script checks the directory for sub-directory called .git/, before proceeding.`},{heading:"submitting-patches",content:`If you are new to submitting patches to open source or new to submitting patches to Apache, start by
reading the On Contributing Patches page from
Apache Commons Project.
It provides a nice overview that applies equally to the Apache HBase Project.`},{heading:"submitting-patches",content:`Make sure you review Code Formatting Conventions for code style. If your patch
was generated incorrectly or your code does not adhere to the code formatting guidelines, you may
be asked to redo some work.`},{heading:"submitting-patches",content:`HBase enforces code style via a maven plugin. After you've written up your changes, apply the
formatter before committing.`},{heading:"submitting-patches",content:`When your commit is ready, present it to the community as a
GitHub Pull Request.`},{heading:"few-general-guidelines",content:`Always patch against the master branch first, even if you want to patch in another branch.
HBase committers always apply patches first to the master branch, and backport as necessary. For
complex patches, you may be asked to perform the backport(s) yourself.`},{heading:"few-general-guidelines",content:`Submit one single PR for a single fix. If necessary, squash local commits to merge local commits
into a single one first. See this
Stack Overflow
question for more information about squashing commits.`},{heading:"few-general-guidelines",content:`Please understand that not every patch may get committed, and that feedback will likely be
provided on the patch.`},{heading:"developer-guidelines-submitting-patches-unit-tests",content:`Always add and/or update relevant unit tests when making the changes.
Make sure that new/changed unit tests pass locally before submitting the patch because it is faster
than waiting for presubmit result which runs full test suite. This will save your own time and
effort.
Use Mockito to make mocks which are very useful for testing failure scenarios by
injecting appropriate failures.`},{heading:"developer-guidelines-submitting-patches-unit-tests",content:`If you are creating a new unit test class, notice how other unit test classes have
classification/sizing annotations before class name and a static methods for setup/teardown of
testing environment. Be sure to include annotations in any new unit test files.
See Tests for more information on tests.`},{heading:"developer-guidelines-submitting-patches-integration-tests",content:"Significant new features should provide an integration test in addition to unit tests, suitable for exercising the new feature at different points in its configuration space."},{heading:"reviewboard",content:"Patches larger than one screen, or patches that will be tricky to review, should go through ReviewBoard."},{heading:"reviewboard",content:"Procedure: Use ReviewBoard"},{heading:"reviewboard",content:`Register for an account if you don't already have one.
It does not use the credentials from issues.apache.org.
Log in.`},{heading:"reviewboard",content:"Click New Review Request."},{heading:"reviewboard",content:`Choose the hbase-git repository.
Click Choose File to select the diff and optionally a parent diff.
Click Create Review Request.`},{heading:"reviewboard",content:`Fill in the fields as required.
At the minimum, fill in the Summary and choose hbase as the Review Group.
If you fill in the Bugs field, the review board links back to the relevant JIRA.
The more fields you fill in, the better.
Click Publish to make your review request public.
An email will be sent to everyone in the hbase group, to review the patch.`},{heading:"reviewboard",content:`Back in your JIRA, click , and paste in the URL of your ReviewBoard request.
This attaches the ReviewBoard to the JIRA, for easy access.`},{heading:"reviewboard",content:"To cancel the request, click ."},{heading:"reviewboard",content:`For more information on how to use ReviewBoard, see the ReviewBoard
documentation.`},{heading:"github",content:`Submitting GitHub pull requests is another accepted form of
contributing patches. Refer to GitHub documentation for details on
how to create pull requests.`},{heading:"github",content:"type: info"},{heading:"github",content:`This section is incomplete and needs to be updated. Refer to
HBASE-23557`},{heading:"github-tooling",content:"Browser bookmarks"},{heading:"github-tooling",content:`Following is a useful javascript based browser bookmark that redirects from GitHub pull
requests to the corresponding jira work item. This redirects based on the HBase jira ID mentioned
in the issue title for the PR. Add the following javascript snippet as a browser bookmark to the
tool bar. Clicking on it while you are on an HBase GitHub PR page redirects you to the corresponding
jira item.`},{heading:"becoming-a-committer",content:`Committers are responsible for reviewing and integrating code changes, testing
and voting on release candidates, weighing in on design discussions, as well as
other types of project contributions. The PMC votes to make a contributor a
committer based on an assessment of their contributions to the project. It is
expected that committers demonstrate a sustained history of high-quality
contributions to the project and community involvement.`},{heading:"becoming-a-committer",content:`Contributions can be made in many ways. There is no single path to becoming a
committer, nor any expected timeline. Submitting features, improvements, and bug
fixes is the most common avenue, but other methods are both recognized and
encouraged (and may be even more important to the health of HBase as a project and a
community). A non-exhaustive list of potential contributions (in no particular
order):`},{heading:"becoming-a-committer",content:`Update the documentation for new
changes, best practices, recipes, and other improvements.`},{heading:"becoming-a-committer",content:"Keep the website up to date."},{heading:"becoming-a-committer",content:`Perform testing and report the results. For instance, scale testing and
testing non-standard configurations is always appreciated.`},{heading:"becoming-a-committer",content:`Maintain the shared Jenkins testing environment and other testing
infrastructure.`},{heading:"becoming-a-committer",content:`Vote on release candidates after performing validation, even if non-binding.
A non-binding vote is a vote by a non-committer.`},{heading:"becoming-a-committer",content:`Provide input for discussion threads on the link:/mail-lists.html[mailing lists] (which usually have
[DISCUSS] in the subject line).`},{heading:"becoming-a-committer",content:`Answer questions questions on the user or developer mailing lists and on
Slack.`},{heading:"becoming-a-committer",content:`Make sure the HBase community is a welcoming one and that we adhere to our
link:/coc.html[Code of conduct]. Alert the PMC if you
have concerns.`},{heading:"becoming-a-committer",content:`Review other people's work (both code and non-code) and provide public
feedback.`},{heading:"becoming-a-committer",content:"Report bugs that are found, or file new feature requests."},{heading:"becoming-a-committer",content:`Triage issues and keep JIRA organized. This includes closing stale issues,
labeling new issues, updating metadata, and other tasks as needed.`},{heading:"becoming-a-committer",content:"Mentor new contributors of all sorts."},{heading:"becoming-a-committer",content:`Give talks and write blogs about HBase. Add these to the link:/[News] section
of the website.`},{heading:"becoming-a-committer",content:"Provide UX feedback about HBase, the web UI, the CLI, APIs, and the website."},{heading:"becoming-a-committer",content:"Write demo applications and scripts."},{heading:"becoming-a-committer",content:"Help attract and retain a diverse community."},{heading:"becoming-a-committer",content:`Interact with other projects in ways that benefit HBase and those other
projects.`},{heading:"becoming-a-committer",content:`Not every individual is able to do all (or even any) of the items on this list.
If you think of other ways to contribute, go for it (and add them to the list).
A pleasant demeanor and willingness to contribute are all you need to make a
positive impact on the HBase project. Invitations to become a committer are the
result of steady interaction with the community over the long term, which builds
trust and recognition.`},{heading:"new-committers",content:`New committers are encouraged to first read Apache's generic committer
documentation:`},{heading:"new-committers",content:"Apache New Committer Guide"},{heading:"new-committers",content:"Apache Committer FAQ"},{heading:"review",content:`HBase committers should, as often as possible, attempt to review patches
submitted by others. Ideally every submitted patch will get reviewed by a
committer within a few days. If a committer reviews a patch they have not
authored, and believe it to be of sufficient quality, then they can commit the
patch. Otherwise the patch should be cancelled with a clear explanation for why
it was rejected.`},{heading:"review",content:`The list of submitted patches is in the
HBase Review Queue,
which is ordered by time of last modification. Committers should scan the list
from top to bottom, looking for patches that they feel qualified to review and
possibly commit. If you see a patch you think someone else is better qualified
to review, you can mention them by username in the JIRA.`},{heading:"review",content:`For non-trivial changes, it is required that another committer review your
patches before commit. Self-commits of non-trivial patches are not allowed.
Use the Submit Patch button in JIRA, just like other contributors, and
then wait for a +1 response from another committer before committing.`},{heading:"reject",content:`Patches which do not adhere to the guidelines in
HowToContribute and to the
code review checklist
should be rejected. Committers should always be polite to contributors and try
to instruct and encourage them to contribute better patches. If a committer
wishes to improve an unacceptable patch, then it should first be rejected, and a
new patch should be attached by the committer for further review.`},{heading:"commit",content:"Committers commit patches to the Apache HBase GIT repository."},{heading:"commit",content:"type: warn"},{heading:"commit",content:"title: Before you commit!!!!"},{heading:"commit",content:`Make sure your local configuration is correct, especially your identity and email. Examine the
output of the $ git config --list command and be sure it is correct. See Set Up
Git if you need pointers.`},{heading:"commit",content:"When you commit a patch:"},{heading:"commit",content:`Include the Jira issue ID in the commit message along with a short description
of the change. Try to add something more than just the Jira title so that
someone looking at git log output doesn't have to go to Jira to discern what
the change is about. Be sure to get the issue ID right, because this causes
Jira to link to the change in Git (use the issue's "All" tab to see these
automatic links).`},{heading:"commit",content:`Commit the patch to a new branch based off master or the other intended
branch. It's a good idea to include the JIRA ID in the name of this branch.
Check out the relevant target branch where you want to commit, and make sure
your local branch has all remote changes, by doing a git pull --rebase or
another similar command. Next, cherry-pick the change into each relevant
branch (such as master), and push the changes to the remote branch using
a command such as git push <remote-server> <remote-branch>.`},{heading:"commit",content:"type: warning"},{heading:"commit",content:`If you do not have all remote changes, the push will fail. If the push fails for any reason,
fix the problem or ask for help. Do not do a git push --force.`},{heading:"commit",content:`Before you can commit a patch, you need to determine how the patch was created.
The instructions and preferences around the way to create patches have changed,
and there will be a transition period.`},{heading:"commit",content:"Determine How a Patch Was Created"},{heading:"commit",content:`If the first few lines of the patch look like the headers of an email, with a From, Date, and
Subject, it was created using git format-patch. This is the preferred way, because you can
reuse the submitter's commit message. If the commit message is not appropriate, you can still use
the commit, then run git commit --amend and reword as appropriate.`},{heading:"commit",content:`If the first line of the patch looks similar to the following, it was created using +git diff+ without --no-prefix.
This is acceptable too.
Notice the a and b in front of the file names.
This is the indication that the patch was not created with --no-prefix.`},{heading:"commit",content:`If the first line of the patch looks similar to the following (without the a and b), the
patch was created with git diff --no-prefix and you need to add -p0 to the git apply command
below.`},{heading:"commit",content:"Example of committing a Patch"},{heading:"commit",content:`One thing you will notice with these examples is that there are a lot of
git pull commands. The only command that actually writes anything to the
remote repository is git push, and you need to make absolutely sure you have
the correct versions of everything and don't have any conflicts before pushing.
The extra git pull commands are usually redundant, but better safe than sorry.`},{heading:"commit",content:`The first example shows how to apply a patch that was generated with +git
format-patch+ and apply it to the master and branch-1 branches.`},{heading:"commit",content:`The directive to use git format-patch rather than git diff, and not to use
--no-prefix, is a new one. See the second example for how to apply a patch
created with git diff, and educate the person who created the patch.`},{heading:"commit",content:`This example shows how to commit a patch that was created using git diff
without --no-prefix. If the patch was created with --no-prefix, add -p0 to
the git apply command.`},{heading:"commit",content:`Resolve the issue as fixed, thanking the contributor.
Always set the "Fix Version" at this point, but only set a single fix version
for each branch where the change was committed, the earliest release in that
branch in which the change will appear.`},{heading:"commit",content:"Commit Message Format"},{heading:"commit",content:`The commit message should contain the JIRA ID and a description of what the patch does.
The preferred commit message format is:`},{heading:"commit",content:`If the contributor used git format-patch to generate the patch, their commit
message is in their patch and you can use that, but be sure the JIRA ID is at
the front of the commit message, even if the contributor left it out.`},{heading:"commit",content:`Use GitHub's "Co-authored-by" when there are multiple authors`},{heading:"commit",content:"We've established the practice of committing to master and then cherry picking back to branches whenever possible, unless"},{heading:"commit",content:"it's breaking compat: In which case, if it can go in minor releases, backport to branch-1 and branch-2."},{heading:"commit",content:"it's a new feature: No for maintenance releases, For minor releases, discuss and arrive at consensus."},{heading:"commit",content:`There are occasions when there are multiple author for a patch.
For example when there is a minor conflict we can fix it up and just proceed with the commit.
The amending author will be different from the original committer, so you should also attribute to the original author by
adding one or more Co-authored-by trailers to the commit's message.
See the GitHub documentation for "Creating a commit with multiple authors".`},{heading:"commit",content:"In short, these are the steps to add Co-authors that will be tracked by GitHub:"},{heading:"commit",content:"Collect the name and email address for each co-author."},{heading:"commit",content:"Commit the change, but after your commit description, instead of a closing quotation, add two empty lines. (Do not close the commit message with a quotation mark)"},{heading:"commit",content:"On the next line of the commit message, type Co-authored-by: name <name@example.com>. After the co-author information, add a closing quotation mark."},{heading:"commit",content:"Here is the example from the GitHub page, using 2 Co-authors:"},{heading:"commit",content:`Note: Amending-Author: Author <committer@apache> was used prior to this
DISCUSSION.`},{heading:"commit",content:"Close related GitHub PRs"},{heading:"commit",content:"As a project we work to ensure there's a JIRA associated with each change, but we don't mandate any particular tool be used for reviews. Due to implementation details of the ASF's integration between hosted git repositories and GitHub, the PMC has no ability to directly close PRs on our GitHub repo. In the event that a contributor makes a Pull Request on GitHub, either because the contributor finds that easier than attaching a patch to JIRA or because a reviewer prefers that UI for examining changes, it's important to make note of the PR in the commit that goes to the master branch so that PRs are kept up to date."},{heading:"commit",content:'To read more about the details of what kinds of commit messages will work with the GitHub "close via keyword in commit" mechanism see the GitHub documentation for "Closing issues using keywords". In summary, you should include a line with the phrase "closes #XXX", where the XXX is the pull request id. The pull request id is usually given in the GitHub UI in grey at the end of the subject heading.'},{heading:"commit",content:"Committers are responsible for making sure commits do not break the build or tests"},{heading:"commit",content:`If a committer commits a patch, it is their responsibility to make sure it passes the test suite.
It is helpful if contributors keep an eye out that their patch does not break the hbase build and/or tests, but ultimately, a contributor cannot be expected to be aware of all the particular vagaries and interconnections that occur in a project like HBase.
A committer should.`},{heading:"commit",content:"Patching Etiquette"},{heading:"commit",content:`In the thread HBase, mail # dev - ANNOUNCEMENT: Git Migration In Progress (WAS =>
Re: Git Migration), it was agreed on the following patch flow`},{heading:"commit",content:"Develop and commit the patch against master first."},{heading:"commit",content:"Try to cherry-pick the patch when backporting if possible."},{heading:"commit",content:"If this does not work, manually commit the patch to the branch."},{heading:"commit",content:"Merge Commits"},{heading:"commit",content:"Avoid merge commits, as they create problems in the git history."},{heading:"commit",content:"Committing Documentation"},{heading:"commit",content:"See appendix contributing to documentation."},{heading:"commit",content:"How to re-trigger github Pull Request checks/re-build"},{heading:"commit",content:`A Pull Request (PR) submission triggers the hbase yetus checks. The checks make
sure the patch doesn't break the build or introduce test failures. The checks take
around four hours to run (They are the same set run when you submit a patch via
HBASE JIRA). When finished, they add a report to the PR as a comment. If a problem
w/ the patch — failed compile, checkstyle violation, or an added findbugs --
the original author makes fixes and pushes a new patch. This re-runs the checks
to produce a new report.`},{heading:"commit",content:`Sometimes though, the patch is good but a flakey, unrelated test has the report vote -1
on the patch. In this case, committers can retrigger the check run by doing a force push of the
exact same patch. Or, click on the Console output link which shows toward the end
of the report (For example https://builds.apache.org/job/HBase-PreCommit-GitHub-PR/job/PR-289/1/console).
This will take you to builds.apache.org, to the build run that failed. See the
"breadcrumbs" along the top (where breadcrumbs is the listing of the directories that
gets us to this particular build page). It'll look something like
Jenkins > HBase-PreCommit-GitHub-PR > PR-289 > #1. Click on the
PR number — i.e. PR-289 in our example — and then, when you've arrived at the PR page,
find the 'Build with Parameters' menu-item (along top left-hand menu). Click here and
then Build leaving the JIRA_ISSUE_KEY empty. This will re-run your checks.`},{heading:"dialog",content:`Committers should hang out in the #hbase room on irc.freenode.net for real-time discussions.
However any substantive discussion (as with any off-list project-related discussion) should be re-iterated in Jira or on the developer list.`},{heading:"do-not-edit-jira-comments",content:"Misspellings and/or bad grammar is preferable to the disruption a JIRA comment edit."},{heading:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:`A new project was created for the release of hbase-2.0.0. It was called
hbase-thirdparty. This project exists only to provide the main hbase
project with relocated — or shaded — versions of popular thirdparty
libraries such as guava, netty, and protobuf. The mainline HBase project
relies on the relocated versions of these libraries gotten from hbase-thirdparty
rather than on finding these classes in their usual locations. We do this so
we can specify whatever the version we wish. If we don't relocate, we must
harmonize our version to match that which hadoop, spark, and other projects use.`},{heading:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:`For developers, this means you need to be careful referring to classes from
netty, guava, protobuf, gson, etc. (see the hbase-thirdparty pom.xml for what
it provides). Devs must refer to the hbase-thirdparty provided classes. In
practice, this is usually not an issue (though it can be a bit of a pain). You
will have to hunt for the relocated version of your particular class. You'll
find it by prepending the general relocation prefix of org.apache.hbase.thirdparty..
For example if you are looking for com.google.protobuf.Message, the relocated
version used by HBase internals can be found at
org.apache.hbase.thirdparty.com.google.protobuf.Message.`},{heading:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:`For a few thirdparty libs, like protobuf (see the protobuf chapter in this book
for the why), your IDE may give you both options — the com.google.protobuf.*
and the org.apache.hbase.thirdparty.com.google.protobuf.* — because both
classes are on your CLASSPATH. Unless you are doing the particular juggling
required in Coprocessor Endpoint development (again see above cited protobuf
chapter), you'll want to use the shaded version, always.`},{heading:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:`The hbase-thirdparty project has groupid of org.apache.hbase.thirdparty.
As of this writing, it provides three jars; one for netty with an artifactid of
hbase-thirdparty-netty, one for protobuf at hbase-thirdparty-protobuf and then
a jar for all else — gson, guava — at hbase-thirdpaty-miscellaneous.`},{heading:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:`The hbase-thirdparty artifacts are a product produced by the Apache HBase
project under the aegis of the HBase Project Management Committee. Releases
are done via the usual voting project on the hbase dev mailing list. If issue
in the hbase-thirdparty, use the hbase JIRA and mailing lists to post notice.`},{heading:"development-of-hbase-related-maven-archetypes",content:`The development of HBase-related Maven archetypes was begun with
HBASE-14876.
For an overview of the hbase-archetypes infrastructure and instructions
for developing new HBase-related Maven archetypes, please see
hbase/hbase-archetypes/README.md.`}],headings:[{id:"branches",content:"Branches"},{id:"policy-for-fix-version-in-jira",content:"Policy for Fix Version in JIRA"},{id:"code-standards",content:"Code Standards"},{id:"interface-classifications",content:"Interface Classifications"},{id:"interfaceaudience",content:"InterfaceAudience"},{id:"interfacestability",content:"@InterfaceStability"},{id:"code-formatting-conventions",content:"Code Formatting Conventions"},{id:"space-invaders",content:"Space Invaders"},{id:"auto-generated-code",content:"Auto Generated Code"},{id:"long-lines",content:"Long Lines"},{id:"trailing-spaces",content:"Trailing Spaces"},{id:"api-documentation-javadoc",content:"API Documentation (Javadoc)"},{id:"findbugs",content:"Findbugs"},{id:"javadoc---useless-defaults",content:"Javadoc - Useless Defaults"},{id:"one-thing-at-a-time-folks",content:"One Thing At A Time, Folks"},{id:"ambiguous-unit-tests",content:"Ambiguous Unit Tests"},{id:"garbage-collection-conserving-guidelines",content:"Garbage-Collection Conserving Guidelines"},{id:"invariants",content:"Invariants"},{id:"no-permanent-state-in-zookeeper",content:"No permanent state in ZooKeeper"},{id:"running-in-situ",content:"Running In-Situ"},{id:"adding-metrics",content:"Adding Metrics"},{id:"add-metric-name-and-function-to-hadoop-compat-interface",content:"Add Metric name and Function to Hadoop Compat Interface."},{id:"add-the-implementation-to-both-hadoop-1-and-hadoop-2-compat-modules",content:"Add the Implementation to Both Hadoop 1 and Hadoop 2 Compat modules."},{id:"git-best-practices",content:"Git Best Practices"},{id:"rebase_all_git_branchessh",content:"rebase_all_git_branches.sh"},{id:"submitting-patches",content:"Submitting Patches"},{id:"few-general-guidelines",content:"Few general guidelines"},{id:"developer-guidelines-submitting-patches-unit-tests",content:"Unit Tests"},{id:"developer-guidelines-submitting-patches-integration-tests",content:"Integration Tests"},{id:"reviewboard",content:"ReviewBoard"},{id:"github",content:"GitHub"},{id:"github-tooling",content:"GitHub Tooling"},{id:"guide-for-hbase-committers",content:"Guide for HBase Committers"},{id:"becoming-a-committer",content:"Becoming a committer"},{id:"new-committers",content:"New committers"},{id:"review",content:"Review"},{id:"reject",content:"Reject"},{id:"commit",content:"Commit"},{id:"dialog",content:"Dialog"},{id:"do-not-edit-jira-comments",content:"Do not edit JIRA comments"},{id:"the-hbase-thirdparty-dependency-and-shadingrelocation",content:"The hbase-thirdparty dependency and shading/relocation"},{id:"development-of-hbase-related-maven-archetypes",content:"Development of HBase-related Maven archetypes"}]};const m=[{depth:2,url:"#branches",title:e.jsx(e.Fragment,{children:"Branches"})},{depth:2,url:"#policy-for-fix-version-in-jira",title:e.jsx(e.Fragment,{children:"Policy for Fix Version in JIRA"})},{depth:2,url:"#code-standards",title:e.jsx(e.Fragment,{children:"Code Standards"})},{depth:3,url:"#interface-classifications",title:e.jsx(e.Fragment,{children:"Interface Classifications"})},{depth:4,url:"#interfaceaudience",title:e.jsx(e.Fragment,{children:"InterfaceAudience"})},{depth:4,url:"#interfacestability",title:e.jsx(e.Fragment,{children:"@InterfaceStability"})},{depth:3,url:"#code-formatting-conventions",title:e.jsx(e.Fragment,{children:"Code Formatting Conventions"})},{depth:4,url:"#space-invaders",title:e.jsx(e.Fragment,{children:"Space Invaders"})},{depth:4,url:"#auto-generated-code",title:e.jsx(e.Fragment,{children:"Auto Generated Code"})},{depth:4,url:"#long-lines",title:e.jsx(e.Fragment,{children:"Long Lines"})},{depth:4,url:"#trailing-spaces",title:e.jsx(e.Fragment,{children:"Trailing Spaces"})},{depth:4,url:"#api-documentation-javadoc",title:e.jsx(e.Fragment,{children:"API Documentation (Javadoc)"})},{depth:4,url:"#findbugs",title:e.jsx(e.Fragment,{children:"Findbugs"})},{depth:4,url:"#javadoc---useless-defaults",title:e.jsx(e.Fragment,{children:"Javadoc - Useless Defaults"})},{depth:4,url:"#one-thing-at-a-time-folks",title:e.jsx(e.Fragment,{children:"One Thing At A Time, Folks"})},{depth:4,url:"#ambiguous-unit-tests",title:e.jsx(e.Fragment,{children:"Ambiguous Unit Tests"})},{depth:3,url:"#garbage-collection-conserving-guidelines",title:e.jsx(e.Fragment,{children:"Garbage-Collection Conserving Guidelines"})},{depth:2,url:"#invariants",title:e.jsx(e.Fragment,{children:"Invariants"})},{depth:3,url:"#no-permanent-state-in-zookeeper",title:e.jsx(e.Fragment,{children:"No permanent state in ZooKeeper"})},{depth:2,url:"#running-in-situ",title:e.jsx(e.Fragment,{children:"Running In-Situ"})},{depth:2,url:"#adding-metrics",title:e.jsx(e.Fragment,{children:"Adding Metrics"})},{depth:3,url:"#add-metric-name-and-function-to-hadoop-compat-interface",title:e.jsx(e.Fragment,{children:"Add Metric name and Function to Hadoop Compat Interface."})},{depth:3,url:"#add-the-implementation-to-both-hadoop-1-and-hadoop-2-compat-modules",title:e.jsx(e.Fragment,{children:"Add the Implementation to Both Hadoop 1 and Hadoop 2 Compat modules."})},{depth:2,url:"#git-best-practices",title:e.jsx(e.Fragment,{children:"Git Best Practices"})},{depth:3,url:"#rebase_all_git_branchessh",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"rebase_all_git_branches.sh"})})},{depth:2,url:"#submitting-patches",title:e.jsx(e.Fragment,{children:"Submitting Patches"})},{depth:3,url:"#few-general-guidelines",title:e.jsx(e.Fragment,{children:"Few general guidelines"})},{depth:3,url:"#developer-guidelines-submitting-patches-unit-tests",title:e.jsx(e.Fragment,{children:"Unit Tests"})},{depth:3,url:"#developer-guidelines-submitting-patches-integration-tests",title:e.jsx(e.Fragment,{children:"Integration Tests"})},{depth:3,url:"#reviewboard",title:e.jsx(e.Fragment,{children:"ReviewBoard"})},{depth:3,url:"#github",title:e.jsx(e.Fragment,{children:"GitHub"})},{depth:4,url:"#github-tooling",title:e.jsx(e.Fragment,{children:"GitHub Tooling"})},{depth:3,url:"#guide-for-hbase-committers",title:e.jsx(e.Fragment,{children:"Guide for HBase Committers"})},{depth:4,url:"#becoming-a-committer",title:e.jsx(e.Fragment,{children:"Becoming a committer"})},{depth:4,url:"#new-committers",title:e.jsx(e.Fragment,{children:"New committers"})},{depth:4,url:"#review",title:e.jsx(e.Fragment,{children:"Review"})},{depth:4,url:"#reject",title:e.jsx(e.Fragment,{children:"Reject"})},{depth:4,url:"#commit",title:e.jsx(e.Fragment,{children:"Commit"})},{depth:3,url:"#dialog",title:e.jsx(e.Fragment,{children:"Dialog"})},{depth:3,url:"#do-not-edit-jira-comments",title:e.jsx(e.Fragment,{children:"Do not edit JIRA comments"})},{depth:2,url:"#the-hbase-thirdparty-dependency-and-shadingrelocation",title:e.jsx(e.Fragment,{children:"The hbase-thirdparty dependency and shading/relocation"})},{depth:2,url:"#development-of-hbase-related-maven-archetypes",title:e.jsx(e.Fragment,{children:"Development of HBase-related Maven archetypes"})}];function r(i){const t={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Callout:s,Step:n,Steps:o}=t;return s||a("Callout"),n||a("Step"),o||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"branches",children:"Branches"}),`
`,e.jsxs(t.p,{children:["We use Git for source code management and latest development happens on ",e.jsx(t.code,{children:"master"}),` branch. There are
branches for past major/minor/maintenance releases and important features and bug fixes are often
back-ported to them.`]}),`
`,e.jsx(t.h2,{id:"policy-for-fix-version-in-jira",children:"Policy for Fix Version in JIRA"}),`
`,e.jsx(t.p,{children:`To determine if a given fix is in a given release purely from the release numbers following rules
are defined:`}),`
`,e.jsxs(t.p,{children:["Fix version of X.Y.Z => fixed in all releases X.Y.Z' (where Z' = Z).",e.jsx(t.br,{}),`
`,"Fix version of X.Y.0 => fixed in all releases X.Y'.* (where Y' = Y).",e.jsx(t.br,{}),`
`,"Fix version of X.0.0 => fixed in all releases X'.*.* (where X' = X)."]}),`
`,e.jsx(t.p,{children:`By this policy, fix version of 1.3.0 implies 1.4.0, but 1.3.2 does not imply 1.4.0 as we could not
tell purely from the numbers which release came first.`}),`
`,e.jsx(t.h2,{id:"code-standards",children:"Code Standards"}),`
`,e.jsx(t.h3,{id:"interface-classifications",children:"Interface Classifications"}),`
`,e.jsx(t.p,{children:`Interfaces are classified both by audience and by stability level.
These labels appear at the head of a class.
The conventions followed by HBase are inherited by its parent project, Hadoop.`}),`
`,e.jsx(t.p,{children:"The following interface classifications are commonly used:"}),`
`,e.jsx(t.h4,{id:"interfaceaudience",children:"InterfaceAudience"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceAudience.Public"}),e.jsx(t.br,{}),`
`,`APIs for users and HBase applications.
These APIs will be deprecated through major versions of HBase.`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceAudience.Private"}),e.jsx(t.br,{}),`
`,`APIs for HBase internals developers.
No guarantees on compatibility or availability in future versions.
Private interfaces do not need an `,e.jsx(t.code,{children:"@InterfaceStability"})," classification."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceAudience.LimitedPrivate(HBaseInterfaceAudience.COPROC)"}),e.jsx(t.br,{}),`
`,"APIs for HBase coprocessor writers."]}),`
`,e.jsxs(t.p,{children:[e.jsxs(t.strong,{children:["No ",e.jsx(t.code,{children:"@InterfaceAudience"})," Classification"]}),":",e.jsx(t.br,{}),`
`,"Packages without an ",e.jsx(t.code,{children:"@InterfaceAudience"}),` label are considered private.
Mark your new packages if publicly accessible.`]}),`
`,e.jsx(s,{type:"info",title:"Excluding Non-Public Interfaces from API Documentation",children:e.jsxs(t.p,{children:["Only interfaces classified ",e.jsx(t.code,{children:"@InterfaceAudience.Public"}),` should be included in API documentation
(Javadoc). Committers must add new package excludes `,e.jsx(t.code,{children:"ExcludePackageNames"})," section of the ",e.jsx(t.em,{children:"pom.xml"}),`
for new packages which do not contain public classes.`]})}),`
`,e.jsx(t.h4,{id:"interfacestability",children:"@InterfaceStability"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceStability"})," is important for packages marked ",e.jsx(t.code,{children:"@InterfaceAudience.Public"}),"."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceStability.Stable"}),e.jsx(t.br,{}),`
`,"Public packages marked as stable cannot be changed without a deprecation path or a very good reason."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceStability.Unstable"}),e.jsx(t.br,{}),`
`,"Public packages marked as unstable can be changed without a deprecation path."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"@InterfaceStability.Evolving"}),e.jsx(t.br,{}),`
`,"Public packages marked as evolving may be changed, but it is discouraged."]}),`
`,e.jsxs(t.p,{children:[e.jsxs(t.strong,{children:["No ",e.jsx(t.code,{children:"@InterfaceStability"})," Label"]}),`:
Public classes with no `,e.jsx(t.code,{children:"@InterfaceStability"})," label are discouraged, and should be considered implicitly unstable."]}),`
`,e.jsx(t.p,{children:"If you are unclear about how to mark packages, ask on the development list."}),`
`,e.jsx(t.h3,{id:"code-formatting-conventions",children:"Code Formatting Conventions"}),`
`,e.jsx(t.p,{children:`Please adhere to the following guidelines so that your patches can be reviewed more quickly.
These guidelines have been developed based upon common feedback on patches from new contributors.`}),`
`,e.jsxs(t.p,{children:["See the ",e.jsx(t.a,{href:"http://www.oracle.com/technetwork/java/index-135089.html",children:"Code Conventions for the Java Programming Language"}),` for more information on coding conventions in Java.
See `,e.jsx(t.a,{href:"/docs/building-and-developing#code-formatting",children:"Eclipse Code Formatting"}),` to setup Eclipse to check for some of
these guidelines automatically.`]}),`
`,e.jsx(t.h4,{id:"space-invaders",children:"Space Invaders"}),`
`,e.jsx(t.p,{children:`Do not use extra spaces around brackets.
Use the second style, rather than the first.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ( foo."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"equals"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"( bar ) ) {     "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't do this"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (foo."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"equals"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(bar)) {"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"foo "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" barArray[ i ];     "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't do this"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"foo "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" barArray[i];"})]})})})}),`
`,e.jsx(t.h4,{id:"auto-generated-code",children:"Auto Generated Code"}),`
`,e.jsxs(t.p,{children:["Auto-generated code in Eclipse often uses bad variable names such as ",e.jsx(t.code,{children:"arg0"}),`.
Use more informative variable names.
Use code like the second example here.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" public"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" readFields"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(DataInput arg0) throws IOException {    "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't do this"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   foo "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" arg0."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"readUTF"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();                                       "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't do this"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" public"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" readFields"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(DataInput di) throws IOException {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   foo "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" di."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"readUTF"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`,e.jsx(t.h4,{id:"long-lines",children:"Long Lines"}),`
`,e.jsx(t.p,{children:`Keep lines less than 100 characters.
You can configure your IDE to do this automatically.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Bar bar "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" foo."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"veryLongMethodWithManyArguments"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(argument1, argument2, argument3, argument4, argument5, argument6, argument7, argument8, argument9);  "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't do this"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Bar bar "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" foo."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"veryLongMethodWithManyArguments"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" argument1, argument2, argument3,argument4, argument5, argument6, argument7, argument8, argument9);"})})]})})}),`
`,e.jsx(t.h4,{id:"trailing-spaces",children:"Trailing Spaces"}),`
`,e.jsx(t.p,{children:`Be sure there is a line break after the end of your code, and avoid lines with nothing but whitespace.
This makes diffs more meaningful.
You can configure your IDE to help with this.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Bar bar "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" foo."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBar"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();     "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<---"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" imagine there is an extra "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"space"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) after the semicolon."})]})})})}),`
`,e.jsx(t.h4,{id:"api-documentation-javadoc",children:"API Documentation (Javadoc)"}),`
`,e.jsx(t.p,{children:"Don't forget Javadoc!"}),`
`,e.jsx(t.p,{children:`Javadoc warnings are checked during precommit.
If the precommit tool gives you a '-1', please fix the javadoc issue.
Your patch won't be committed if it adds such warnings.`}),`
`,e.jsxs(t.p,{children:["Also, no ",e.jsx(t.code,{children:"@author"})," tags - that's a rule."]}),`
`,e.jsx(t.h4,{id:"findbugs",children:"Findbugs"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"Findbugs"}),` is used to detect common bugs pattern.
It is checked during the precommit build.
If errors are found, please fix them.
You can run findbugs locally with `,e.jsx(t.code,{children:"mvn                             findbugs:findbugs"}),", which will generate the ",e.jsx(t.code,{children:"findbugs"}),` files locally.
Sometimes, you may have to write code smarter than `,e.jsx(t.code,{children:"findbugs"}),`.
You can annotate your code to tell `,e.jsx(t.code,{children:"findbugs"})," you know what you're doing, by annotating your class with the following annotation:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"@"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"edu.umd.cs.findbugs.annotations.SuppressWarnings"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"HE_EQUALS_USE_HASHCODE"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"justification"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"I know what I'm doing"`}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(t.p,{children:[`It is important to use the Apache-licensed version of the annotations. That generally means using
annotations in the `,e.jsx(t.code,{children:"edu.umd.cs.findbugs.annotations"}),` package so that we can rely on the cleanroom
reimplementation rather than annotations in the `,e.jsx(t.code,{children:"javax.annotations"})," package."]}),`
`,e.jsx(t.h4,{id:"javadoc---useless-defaults",children:"Javadoc - Useless Defaults"}),`
`,e.jsx(t.p,{children:"Don't just leave javadoc tags the way IDE generates them, or fill redundant information in them."}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  /**"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   * "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@param"}),e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:" table"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"                              <---- don't leave them empty!"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   * "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@param"}),e.jsx(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:" region"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" An HRegion object.          <---- don't fill redundant information!"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   * "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@return"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" Foo Object foo just created.      <---- Not useful information"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   * "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@throws"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeException"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"                     <---- Not useful. Function declarations already tell that!"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   * "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@throws"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BarException"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" when something went wrong  <---- really?"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   */"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Foo "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createFoo"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bar bar);"})]})]})})}),`
`,e.jsx(t.p,{children:`Either add something descriptive to the tags, or just remove them.
The preference is to add something descriptive and useful.`}),`
`,e.jsx(t.h4,{id:"one-thing-at-a-time-folks",children:"One Thing At A Time, Folks"}),`
`,e.jsx(t.p,{children:"If you submit a patch for one thing, don't do auto-reformatting or unrelated reformatting of code on a completely different area of code."}),`
`,e.jsx(t.p,{children:"Likewise, don't add unrelated cleanup or refactorings outside the scope of your Jira."}),`
`,e.jsx(t.h4,{id:"ambiguous-unit-tests",children:"Ambiguous Unit Tests"}),`
`,e.jsx(t.p,{children:"Make sure that you're clear about what you are testing in your unit tests and why."}),`
`,e.jsx(t.h3,{id:"garbage-collection-conserving-guidelines",children:"Garbage-Collection Conserving Guidelines"}),`
`,e.jsxs(t.p,{children:["The following guidelines were borrowed from ",e.jsx(t.a,{href:"http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage",children:"http://engineering.linkedin.com/performance/linkedin-feed-faster-less-jvm-garbage"}),`.
Keep them in mind to keep preventable garbage collection to a minimum. Have a look
at the blog post for some great examples of how to refactor your code according to
these guidelines.`]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Be careful with Iterators"}),`
`,e.jsx(t.li,{children:"Estimate the size of a collection when initializing"}),`
`,e.jsx(t.li,{children:"Defer expression evaluation"}),`
`,e.jsx(t.li,{children:"Compile the regex patterns in advance"}),`
`,e.jsx(t.li,{children:"Cache it if you can"}),`
`,e.jsx(t.li,{children:"String Interns are useful but dangerous"}),`
`]}),`
`,e.jsx(t.h2,{id:"invariants",children:"Invariants"}),`
`,e.jsx(t.p,{children:`We don't have many but what we have we list below.
All are subject to challenge of course but until then, please hold to the rules of the road.`}),`
`,e.jsx(t.h3,{id:"no-permanent-state-in-zookeeper",children:"No permanent state in ZooKeeper"}),`
`,e.jsx(t.p,{children:"ZooKeeper state should transient (treat it like memory). If ZooKeeper state is deleted, hbase should be able to recover and essentially be in the same state."}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:".Exceptions: There are currently a few exceptions that we need to fix around whether a table is enabled or disabled."}),`
`,e.jsxs(t.li,{children:[`Replication data is currently stored only in ZooKeeper.
Deleting ZooKeeper data related to replication may cause replication to be disabled.
Do not delete the replication tree, `,e.jsx(t.em,{children:"/hbase/replication/"}),"."]}),`
`]}),`
`,e.jsx(s,{type:"warning",children:e.jsxs(t.p,{children:[`Replication may be disrupted and data loss may occur if you delete the replication tree
(`,e.jsx(t.em,{children:"/hbase/replication/"}),`) from ZooKeeper. Follow progress on this issue at
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-10295",children:"HBASE-10295"}),"."]})}),`
`,e.jsx(t.h2,{id:"running-in-situ",children:"Running In-Situ"}),`
`,e.jsx(t.p,{children:`If you are developing Apache HBase, frequently it is useful to test your changes against a more-real cluster than what you find in unit tests.
In this case, HBase can be run directly from the source in local-mode.
All you need to do is run:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}/bin/start-hbase.sh"})})})})}),`
`,e.jsx(t.p,{children:"This will spin up a full local-cluster, just as if you had packaged up HBase and installed it on your machine."}),`
`,e.jsx(t.p,{children:`Keep in mind that you will need to have installed HBase into your local maven repository for the in-situ cluster to work properly.
That is, you will need to run:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsx(t.p,{children:`to ensure that maven can find the correct classpath and dependencies.
Generally, the above command is just a good thing to try running first, if maven is acting oddly.`}),`
`,e.jsx(t.h2,{id:"adding-metrics",children:"Adding Metrics"}),`
`,e.jsxs(t.p,{children:[`After adding a new feature a developer might want to add metrics.
HBase exposes metrics using the Hadoop Metrics 2 system, so adding a new metric involves exposing that metric to the hadoop system.
Unfortunately the API of metrics2 changed from hadoop 1 to hadoop 2.
In order to get around this a set of interfaces and implementations have to be loaded at runtime.
To get an in-depth look at the reasoning and structure of these classes you can read the blog post located `,e.jsx(t.a,{href:"https://blogs.apache.org/hbase/entry/migration_to_the_new_metrics",children:"here"}),`.
To add a metric to an existing MBean follow the short guide below:`]}),`
`,e.jsx(t.h3,{id:"add-metric-name-and-function-to-hadoop-compat-interface",children:"Add Metric name and Function to Hadoop Compat Interface."}),`
`,e.jsx(t.p,{children:`Inside of the source interface the corresponds to where the metrics are generated (eg MetricsMasterSource for things coming from HMaster) create new static strings for metric name and description.
Then add a new method that will be called to add new reading.`}),`
`,e.jsx(t.h3,{id:"add-the-implementation-to-both-hadoop-1-and-hadoop-2-compat-modules",children:"Add the Implementation to Both Hadoop 1 and Hadoop 2 Compat modules."}),`
`,e.jsx(t.p,{children:`Inside of the implementation of the source (eg.
MetricsMasterSourceImpl in the above example) create a new histogram, counter, gauge, or stat in the init method.
Then in the method that was added to the interface wire up the parameter passed in to the histogram.`}),`
`,e.jsx(t.p,{children:`Now add tests that make sure the data is correctly exported to the metrics 2 system.
For this the MetricsAssertHelper is provided.`}),`
`,e.jsx(t.h2,{id:"git-best-practices",children:"Git Best Practices"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Avoid git merges."}),e.jsx(t.br,{}),`
`,"Use ",e.jsx(t.code,{children:"git pull --rebase"})," or ",e.jsx(t.code,{children:"git fetch"})," followed by ",e.jsx(t.code,{children:"git rebase"}),"."]}),`
`,e.jsxs(t.p,{children:[e.jsxs(t.strong,{children:["Do not use ",e.jsx(t.code,{children:"git push --force"}),"."]}),e.jsx(t.br,{}),`
`,"If the push does not work, fix the problem or ask for help."]}),`
`,e.jsx(t.p,{children:"Please contribute to this document if you think of other Git best practices."}),`
`,e.jsx(t.h3,{id:"rebase_all_git_branchessh",children:e.jsx(t.code,{children:"rebase_all_git_branches.sh"})}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.em,{children:"dev-support/rebase_all_git_branches.sh"}),` script is provided to help keep your Git repository clean.
Use the `,e.jsx(t.code,{children:"-h"}),` parameter to get usage instructions.
The script automatically refreshes your tracking branches, attempts an automatic rebase of each local branch against its remote branch, and gives you the option to delete any branch which represents a closed `,e.jsx(t.code,{children:"HBASE-"}),` JIRA.
The script has one optional configuration option, the location of your Git directory.
You can set a default by editing the script.
Otherwise, you can pass the git directory manually by using the `,e.jsx(t.code,{children:"-d"}),` parameter, followed by an absolute or relative directory name, or even '.' for the current working directory.
The script checks the directory for sub-directory called `,e.jsx(t.em,{children:".git/"}),", before proceeding."]}),`
`,e.jsx(t.h2,{id:"submitting-patches",children:"Submitting Patches"}),`
`,e.jsxs(t.p,{children:[`If you are new to submitting patches to open source or new to submitting patches to Apache, start by
reading the `,e.jsx(t.a,{href:"https://commons.apache.org/patches.html",children:"On Contributing Patches"}),` page from
`,e.jsx(t.a,{href:"https://commons.apache.org/",children:"Apache Commons Project"}),`.
It provides a nice overview that applies equally to the Apache HBase Project.`]}),`
`,e.jsxs(t.p,{children:["Make sure you review ",e.jsx(t.a,{href:"/docs/building-and-developing/developer-guidelines#code-formatting-conventions",children:"Code Formatting Conventions"}),` for code style. If your patch
was generated incorrectly or your code does not adhere to the code formatting guidelines, you may
be asked to redo some work.`]}),`
`,e.jsx(t.p,{children:`HBase enforces code style via a maven plugin. After you've written up your changes, apply the
formatter before committing.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" spotless:apply"})]})})})}),`
`,e.jsxs(t.p,{children:[`When your commit is ready, present it to the community as a
`,e.jsx(t.a,{href:"https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",children:"GitHub Pull Request"}),"."]}),`
`,e.jsx(t.h3,{id:"few-general-guidelines",children:"Few general guidelines"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:`Always patch against the master branch first, even if you want to patch in another branch.
HBase committers always apply patches first to the master branch, and backport as necessary. For
complex patches, you may be asked to perform the backport(s) yourself.`}),`
`,e.jsxs(t.li,{children:[`Submit one single PR for a single fix. If necessary, squash local commits to merge local commits
into a single one first. See this
`,e.jsx(t.a,{href:"http://stackoverflow.com/questions/5308816/how-to-use-git-merge-squash",children:`Stack Overflow
question`})," for more information about squashing commits."]}),`
`,e.jsx(t.li,{children:`Please understand that not every patch may get committed, and that feedback will likely be
provided on the patch.`}),`
`]}),`
`,e.jsx(t.h3,{id:"developer-guidelines-submitting-patches-unit-tests",children:"Unit Tests"}),`
`,e.jsxs(t.p,{children:[`Always add and/or update relevant unit tests when making the changes.
Make sure that new/changed unit tests pass locally before submitting the patch because it is faster
than waiting for presubmit result which runs full test suite. This will save your own time and
effort.
Use `,e.jsx(t.a,{href:"https://site.mockito.org/",children:"Mockito"}),` to make mocks which are very useful for testing failure scenarios by
injecting appropriate failures.`]}),`
`,e.jsxs(t.p,{children:[`If you are creating a new unit test class, notice how other unit test classes have
classification/sizing annotations before class name and a static methods for setup/teardown of
testing environment. Be sure to include annotations in any new unit test files.
See `,e.jsx(t.a,{href:"/docs/building-and-developing/tests",children:"Tests"})," for more information on tests."]}),`
`,e.jsx(t.h3,{id:"developer-guidelines-submitting-patches-integration-tests",children:"Integration Tests"}),`
`,e.jsx(t.p,{children:"Significant new features should provide an integration test in addition to unit tests, suitable for exercising the new feature at different points in its configuration space."}),`
`,e.jsx(t.h3,{id:"reviewboard",children:"ReviewBoard"}),`
`,e.jsxs(t.p,{children:["Patches larger than one screen, or patches that will be tricky to review, should go through ",e.jsx(t.a,{href:"https://reviews.apache.org",children:"ReviewBoard"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Procedure: Use ReviewBoard"})}),`
`,e.jsxs(o,{children:[e.jsx(n,{children:e.jsxs(t.p,{children:[`Register for an account if you don't already have one.
It does not use the credentials from `,e.jsx(t.a,{href:"https://issues.apache.org",children:"issues.apache.org"}),`.
Log in.`]})}),e.jsx(n,{children:e.jsxs(t.p,{children:["Click ",e.jsx(t.strong,{children:"New Review Request"}),"."]})}),e.jsx(n,{children:e.jsxs(t.p,{children:["Choose the ",e.jsx(t.code,{children:"hbase-git"}),` repository.
Click Choose File to select the diff and optionally a parent diff.
Click `,e.jsx(t.strong,{children:"Create Review Request"}),"."]})}),e.jsx(n,{children:e.jsxs(t.p,{children:[`Fill in the fields as required.
At the minimum, fill in the `,e.jsx(t.strong,{children:"Summary"})," and choose ",e.jsx(t.code,{children:"hbase"})," as the ",e.jsx(t.strong,{children:"Review Group"}),`.
If you fill in the `,e.jsx(t.strong,{children:"Bugs"}),` field, the review board links back to the relevant JIRA.
The more fields you fill in, the better.
Click `,e.jsx(t.strong,{children:"Publish"}),` to make your review request public.
An email will be sent to everyone in the `,e.jsx(t.code,{children:"hbase"})," group, to review the patch."]})}),e.jsx(n,{children:e.jsx(t.p,{children:`Back in your JIRA, click , and paste in the URL of your ReviewBoard request.
This attaches the ReviewBoard to the JIRA, for easy access.`})}),e.jsx(n,{children:e.jsx(t.p,{children:"To cancel the request, click ."})})]}),`
`,e.jsxs(t.p,{children:["For more information on how to use ReviewBoard, see ",e.jsx(t.a,{href:"http://www.reviewboard.org/docs/manual/1.5/",children:`the ReviewBoard
documentation`}),"."]}),`
`,e.jsx(t.h3,{id:"github",children:"GitHub"}),`
`,e.jsxs(t.p,{children:["Submitting ",e.jsx(t.a,{href:"https://github.com/apache/hbase",children:"GitHub"}),` pull requests is another accepted form of
contributing patches. Refer to GitHub `,e.jsx(t.a,{href:"https://help.github.com/",children:"documentation"}),` for details on
how to create pull requests.`]}),`
`,e.jsx(s,{type:"info",children:e.jsxs(t.p,{children:[`This section is incomplete and needs to be updated. Refer to
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-23557",children:"HBASE-23557"})]})}),`
`,e.jsx(t.h4,{id:"github-tooling",children:"GitHub Tooling"}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Browser bookmarks"})}),`
`,e.jsx(t.p,{children:`Following is a useful javascript based browser bookmark that redirects from GitHub pull
requests to the corresponding jira work item. This redirects based on the HBase jira ID mentioned
in the issue title for the PR. Add the following javascript snippet as a browser bookmark to the
tool bar. Clicking on it while you are on an HBase GitHub PR page redirects you to the corresponding
jira item.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"location.href "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "https://issues.apache.org/jira/browse/"'}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  document."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getElementsByClassName"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"js-issue-title"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")["}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"].innerHTML."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"match"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#DBEDFF"},children:"HBASE-"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\d"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")["}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"];"})]})]})})}),`
`,e.jsx(t.h3,{id:"guide-for-hbase-committers",children:"Guide for HBase Committers"}),`
`,e.jsx(t.h4,{id:"becoming-a-committer",children:"Becoming a committer"}),`
`,e.jsx(t.p,{children:`Committers are responsible for reviewing and integrating code changes, testing
and voting on release candidates, weighing in on design discussions, as well as
other types of project contributions. The PMC votes to make a contributor a
committer based on an assessment of their contributions to the project. It is
expected that committers demonstrate a sustained history of high-quality
contributions to the project and community involvement.`}),`
`,e.jsx(t.p,{children:`Contributions can be made in many ways. There is no single path to becoming a
committer, nor any expected timeline. Submitting features, improvements, and bug
fixes is the most common avenue, but other methods are both recognized and
encouraged (and may be even more important to the health of HBase as a project and a
community). A non-exhaustive list of potential contributions (in no particular
order):`}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/contributing-to-documentation",children:"Update the documentation"}),` for new
changes, best practices, recipes, and other improvements.`]}),`
`,e.jsx(t.li,{children:"Keep the website up to date."}),`
`,e.jsx(t.li,{children:`Perform testing and report the results. For instance, scale testing and
testing non-standard configurations is always appreciated.`}),`
`,e.jsx(t.li,{children:`Maintain the shared Jenkins testing environment and other testing
infrastructure.`}),`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/building-and-developing/voting",children:"Vote on release candidates"}),` after performing validation, even if non-binding.
A non-binding vote is a vote by a non-committer.`]}),`
`,e.jsxs(t.li,{children:[`Provide input for discussion threads on the link:/mail-lists.html[mailing lists] (which usually have
`,e.jsx(t.code,{children:"[DISCUSS]"})," in the subject line)."]}),`
`,e.jsx(t.li,{children:`Answer questions questions on the user or developer mailing lists and on
Slack.`}),`
`,e.jsx(t.li,{children:`Make sure the HBase community is a welcoming one and that we adhere to our
link:/coc.html[Code of conduct]. Alert the PMC if you
have concerns.`}),`
`,e.jsx(t.li,{children:`Review other people's work (both code and non-code) and provide public
feedback.`}),`
`,e.jsx(t.li,{children:"Report bugs that are found, or file new feature requests."}),`
`,e.jsx(t.li,{children:`Triage issues and keep JIRA organized. This includes closing stale issues,
labeling new issues, updating metadata, and other tasks as needed.`}),`
`,e.jsx(t.li,{children:"Mentor new contributors of all sorts."}),`
`,e.jsx(t.li,{children:`Give talks and write blogs about HBase. Add these to the link:/[News] section
of the website.`}),`
`,e.jsx(t.li,{children:"Provide UX feedback about HBase, the web UI, the CLI, APIs, and the website."}),`
`,e.jsx(t.li,{children:"Write demo applications and scripts."}),`
`,e.jsx(t.li,{children:"Help attract and retain a diverse community."}),`
`,e.jsx(t.li,{children:`Interact with other projects in ways that benefit HBase and those other
projects.`}),`
`]}),`
`,e.jsx(t.p,{children:`Not every individual is able to do all (or even any) of the items on this list.
If you think of other ways to contribute, go for it (and add them to the list).
A pleasant demeanor and willingness to contribute are all you need to make a
positive impact on the HBase project. Invitations to become a committer are the
result of steady interaction with the community over the long term, which builds
trust and recognition.`}),`
`,e.jsx(t.h4,{id:"new-committers",children:"New committers"}),`
`,e.jsx(t.p,{children:`New committers are encouraged to first read Apache's generic committer
documentation:`}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://www.apache.org/dev/new-committers-guide.html",children:"Apache New Committer Guide"})}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://www.apache.org/dev/committers.html",children:"Apache Committer FAQ"})}),`
`]}),`
`,e.jsx(t.h4,{id:"review",children:"Review"}),`
`,e.jsxs(t.p,{children:[`HBase committers should, as often as possible, attempt to review patches
submitted by others. Ideally every submitted patch will get reviewed by a
committer `,e.jsx(t.em,{children:"within a few days"}),`. If a committer reviews a patch they have not
authored, and believe it to be of sufficient quality, then they can commit the
patch. Otherwise the patch should be cancelled with a clear explanation for why
it was rejected.`]}),`
`,e.jsxs(t.p,{children:[`The list of submitted patches is in the
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/secure/IssueNavigator.jspa?mode=hide&requestId=12312392",children:"HBase Review Queue"}),`,
which is ordered by time of last modification. Committers should scan the list
from top to bottom, looking for patches that they feel qualified to review and
possibly commit. If you see a patch you think someone else is better qualified
to review, you can mention them by username in the JIRA.`]}),`
`,e.jsxs(t.p,{children:[`For non-trivial changes, it is required that another committer review your
patches before commit. `,e.jsx(t.strong,{children:"Self-commits of non-trivial patches are not allowed."}),`
Use the `,e.jsx(t.strong,{children:"Submit Patch"}),` button in JIRA, just like other contributors, and
then wait for a `,e.jsx(t.code,{children:"+1"})," response from another committer before committing."]}),`
`,e.jsx(t.h4,{id:"reject",children:"Reject"}),`
`,e.jsxs(t.p,{children:[`Patches which do not adhere to the guidelines in
`,e.jsx(t.a,{href:"/docs/building-and-developing",children:"HowToContribute"}),` and to the
`,e.jsx(t.a,{href:"https://cwiki.apache.org/confluence/display/HADOOP2/CodeReviewChecklist",children:"code review checklist"}),`
should be rejected. Committers should always be polite to contributors and try
to instruct and encourage them to contribute better patches. If a committer
wishes to improve an unacceptable patch, then it should first be rejected, and a
new patch should be attached by the committer for further review.`]}),`
`,e.jsx(t.h4,{id:"commit",children:"Commit"}),`
`,e.jsx(t.p,{children:"Committers commit patches to the Apache HBase GIT repository."}),`
`,e.jsx(s,{type:"warn",title:"Before you commit!!!!",children:e.jsxs(t.p,{children:[`Make sure your local configuration is correct, especially your identity and email. Examine the
output of the `,e.jsx(t.code,{children:"$ git config --list"})," command and be sure it is correct. See ",e.jsx(t.a,{href:"https://help.github.com/articles/set-up-git",children:`Set Up
Git`})," if you need pointers."]})}),`
`,e.jsx(t.p,{children:"When you commit a patch:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[`Include the Jira issue ID in the commit message along with a short description
of the change. Try to add something more than just the Jira title so that
someone looking at `,e.jsx(t.code,{children:"git log"}),` output doesn't have to go to Jira to discern what
the change is about. Be sure to get the issue ID right, because this causes
Jira to link to the change in Git (use the issue's "All" tab to see these
automatic links).`]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Commit the patch to a new branch based off ",e.jsx(t.code,{children:"master"}),` or the other intended
branch. It's a good idea to include the JIRA ID in the name of this branch.
Check out the relevant target branch where you want to commit, and make sure
your local branch has all remote changes, by doing a `,e.jsx(t.code,{children:"git pull --rebase"}),` or
another similar command. Next, cherry-pick the change into each relevant
branch (such as master), and push the changes to the remote branch using
a command such as `,e.jsx(t.code,{children:"git push <remote-server> <remote-branch>"}),"."]}),`
`,e.jsx(s,{type:"warning",children:e.jsxs(t.p,{children:[`If you do not have all remote changes, the push will fail. If the push fails for any reason,
fix the problem or ask for help. Do not do a `,e.jsx(t.code,{children:"git push --force"}),"."]})}),`
`,e.jsx(t.p,{children:`Before you can commit a patch, you need to determine how the patch was created.
The instructions and preferences around the way to create patches have changed,
and there will be a transition period.`}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Determine How a Patch Was Created"})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[`If the first few lines of the patch look like the headers of an email, with a From, Date, and
Subject, it was created using `,e.jsx(t.code,{children:"git format-patch"}),`. This is the preferred way, because you can
reuse the submitter's commit message. If the commit message is not appropriate, you can still use
the commit, then run `,e.jsx(t.code,{children:"git commit --amend"})," and reword as appropriate."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["If the first line of the patch looks similar to the following, it was created using +git diff+ without ",e.jsx(t.code,{children:"--no-prefix"}),`.
This is acceptable too.
Notice the `,e.jsx(t.code,{children:"a"})," and ",e.jsx(t.code,{children:"b"}),` in front of the file names.
This is the indication that the patch was not created with `,e.jsx(t.code,{children:"--no-prefix"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"diff --git a/src/main/asciidoc/_chapters/developer.adoc b/src/main/asciidoc/_chapters/developer.adoc"})})})})}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["If the first line of the patch looks similar to the following (without the ",e.jsx(t.code,{children:"a"})," and ",e.jsx(t.code,{children:"b"}),`), the
patch was created with `,e.jsx(t.code,{children:"git diff --no-prefix"})," and you need to add ",e.jsx(t.code,{children:"-p0"})," to the ",e.jsx(t.code,{children:"git apply"}),` command
below.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"diff --git src/main/asciidoc/_chapters/developer.adoc src/main/asciidoc/_chapters/developer.adoc"})})})})}),`
`]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example of committing a Patch"})}),`
`,e.jsxs(t.p,{children:[`One thing you will notice with these examples is that there are a lot of
`,e.jsx(t.code,{children:"git pull"}),` commands. The only command that actually writes anything to the
remote repository is `,e.jsx(t.code,{children:"git push"}),`, and you need to make absolutely sure you have
the correct versions of everything and don't have any conflicts before pushing.
The extra `,e.jsx(t.code,{children:"git pull"})," commands are usually redundant, but better safe than sorry."]}),`
`,e.jsxs(t.p,{children:[`The first example shows how to apply a patch that was generated with +git
format-patch+ and apply it to the `,e.jsx(t.code,{children:"master"})," and ",e.jsx(t.code,{children:"branch-1"})," branches."]}),`
`,e.jsxs(t.p,{children:["The directive to use ",e.jsx(t.code,{children:"git format-patch"})," rather than ",e.jsx(t.code,{children:"git diff"}),`, and not to use
`,e.jsx(t.code,{children:"--no-prefix"}),`, is a new one. See the second example for how to apply a patch
created with `,e.jsx(t.code,{children:"git diff"}),", and educate the person who created the patch."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -b"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-XXXX"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" am"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/Downloads/HBASE-XXXX-v2.patch"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --signoff"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  # If you are committing someone else's patch."})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cherry-pick"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"sha-from-commi"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"t"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Resolve conflicts if necessary or ask the submitter to do it"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"          # Better safe than sorry"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" push"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Backport to branch-1"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-1"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cherry-pick"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"sha-from-commi"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"t"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Resolve conflicts if necessary"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"          # Better safe than sorry"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" push"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-1"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -D"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-XXXX"})]})]})})}),`
`,e.jsxs(t.p,{children:["This example shows how to commit a patch that was created using ",e.jsx(t.code,{children:"git diff"}),`
without `,e.jsx(t.code,{children:"--no-prefix"}),". If the patch was created with ",e.jsx(t.code,{children:"--no-prefix"}),", add ",e.jsx(t.code,{children:"-p0"}),` to
the `,e.jsx(t.code,{children:"git apply"})," command."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apply"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/Downloads/HBASE-XXXX-v2.patch"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" commit"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -m"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "HBASE-XXXX Really Good Code Fix (Joe Schmo)"'}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --author="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"contributor"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -a"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  # This and next command is needed for patches created with 'git diff'"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" commit"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --amend"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --signoff"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cherry-pick"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"sha-from-commi"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"t"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Resolve conflicts if necessary or ask the submitter to do it"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"          # Better safe than sorry"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" push"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Backport to branch-1"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-1"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cherry-pick"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"sha-from-commi"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"t"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Resolve conflicts if necessary or ask the submitter to do it"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pull"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rebase"}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"           # Better safe than sorry"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" push"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-1"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -D"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-XXXX"})]})]})})}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsx(t.p,{children:`Resolve the issue as fixed, thanking the contributor.
Always set the "Fix Version" at this point, but only set a single fix version
for each branch where the change was committed, the earliest release in that
branch in which the change will appear.`}),`
`]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Commit Message Format"})}),`
`,e.jsx(t.p,{children:`The commit message should contain the JIRA ID and a description of what the patch does.
The preferred commit message format is:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"<jira-id> <jira-title> (<contributor-name-if-not-commit-author>)"})})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"HBASE-12345 Fix All The Things (jane@example.com)"})})})})}),`
`,e.jsxs(t.p,{children:["If the contributor used ",e.jsx(t.code,{children:"git format-patch"}),` to generate the patch, their commit
message is in their patch and you can use that, but be sure the JIRA ID is at
the front of the commit message, even if the contributor left it out.`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:`Use GitHub's "Co-authored-by" when there are multiple authors`})}),`
`,e.jsx(t.p,{children:"We've established the practice of committing to master and then cherry picking back to branches whenever possible, unless"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"it's breaking compat: In which case, if it can go in minor releases, backport to branch-1 and branch-2."}),`
`,e.jsx(t.li,{children:"it's a new feature: No for maintenance releases, For minor releases, discuss and arrive at consensus."}),`
`]}),`
`,e.jsxs(t.p,{children:[`There are occasions when there are multiple author for a patch.
For example when there is a minor conflict we can fix it up and just proceed with the commit.
The amending author will be different from the original committer, so you should also attribute to the original author by
adding one or more `,e.jsx(t.code,{children:"Co-authored-by"}),` trailers to the commit's message.
See `,e.jsx(t.a,{href:"https://help.github.com/en/articles/creating-a-commit-with-multiple-authors/",children:'the GitHub documentation for "Creating a commit with multiple authors"'}),"."]}),`
`,e.jsx(t.p,{children:"In short, these are the steps to add Co-authors that will be tracked by GitHub:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Collect the name and email address for each co-author."}),`
`,e.jsx(t.li,{children:"Commit the change, but after your commit description, instead of a closing quotation, add two empty lines. (Do not close the commit message with a quotation mark)"}),`
`,e.jsxs(t.li,{children:["On the next line of the commit message, type ",e.jsx(t.code,{children:"Co-authored-by: name <name@example.com>"}),". After the co-author information, add a closing quotation mark."]}),`
`]}),`
`,e.jsx(t.p,{children:"Here is the example from the GitHub page, using 2 Co-authors:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" commit"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -m"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Refactor usability tests.'})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:">"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:">"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Co-authored-by: name <name@example.com>"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'Co-authored-by: another-name <another-name@example.com>"'})})]})})}),`
`,e.jsxs(t.p,{children:["Note: ",e.jsx(t.code,{children:"Amending-Author: Author <committer@apache>"}),` was used prior to this
`,e.jsx(t.a,{href:"https://lists.apache.org/thread.html/f00b5f9b65570e777dbb31c37d7b0ffc55c5fc567aefdb456608a042@%3Cdev.hbase.apache.org%3E",children:"DISCUSSION"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Close related GitHub PRs"})}),`
`,e.jsx(t.p,{children:"As a project we work to ensure there's a JIRA associated with each change, but we don't mandate any particular tool be used for reviews. Due to implementation details of the ASF's integration between hosted git repositories and GitHub, the PMC has no ability to directly close PRs on our GitHub repo. In the event that a contributor makes a Pull Request on GitHub, either because the contributor finds that easier than attaching a patch to JIRA or because a reviewer prefers that UI for examining changes, it's important to make note of the PR in the commit that goes to the master branch so that PRs are kept up to date."}),`
`,e.jsxs(t.p,{children:['To read more about the details of what kinds of commit messages will work with the GitHub "close via keyword in commit" mechanism see ',e.jsx(t.a,{href:"https://help.github.com/articles/closing-issues-using-keywords/",children:'the GitHub documentation for "Closing issues using keywords"'}),'. In summary, you should include a line with the phrase "closes #XXX", where the XXX is the pull request id. The pull request id is usually given in the GitHub UI in grey at the end of the subject heading.']}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Committers are responsible for making sure commits do not break the build or tests"})}),`
`,e.jsx(t.p,{children:`If a committer commits a patch, it is their responsibility to make sure it passes the test suite.
It is helpful if contributors keep an eye out that their patch does not break the hbase build and/or tests, but ultimately, a contributor cannot be expected to be aware of all the particular vagaries and interconnections that occur in a project like HBase.
A committer should.`}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Patching Etiquette"})}),`
`,e.jsxs(t.p,{children:["In the thread ",e.jsx(t.a,{href:"https://lists.apache.org/thread.html/186fcd5eb71973a7b282ecdba41606d3d221efd505d533bb729e1fad%401400648690%40%3Cdev.hbase.apache.org%3E",children:`HBase, mail # dev - ANNOUNCEMENT: Git Migration In Progress (WAS =>
Re: Git Migration)`}),", it was agreed on the following patch flow"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Develop and commit the patch against master first."}),`
`,e.jsx(t.li,{children:"Try to cherry-pick the patch when backporting if possible."}),`
`,e.jsx(t.li,{children:"If this does not work, manually commit the patch to the branch."}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Merge Commits"})}),`
`,e.jsx(t.p,{children:"Avoid merge commits, as they create problems in the git history."}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Committing Documentation"})}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/contributing-to-documentation",children:"appendix contributing to documentation"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"How to re-trigger github Pull Request checks/re-build"})}),`
`,e.jsx(t.p,{children:`A Pull Request (PR) submission triggers the hbase yetus checks. The checks make
sure the patch doesn't break the build or introduce test failures. The checks take
around four hours to run (They are the same set run when you submit a patch via
HBASE JIRA). When finished, they add a report to the PR as a comment. If a problem
w/ the patch — failed compile, checkstyle violation, or an added findbugs --
the original author makes fixes and pushes a new patch. This re-runs the checks
to produce a new report.`}),`
`,e.jsxs(t.p,{children:[`Sometimes though, the patch is good but a flakey, unrelated test has the report vote -1
on the patch. In this case, `,e.jsx(t.strong,{children:"committers"}),` can retrigger the check run by doing a force push of the
exact same patch. Or, click on the `,e.jsx(t.code,{children:"Console output"}),` link which shows toward the end
of the report (For example `,e.jsx(t.code,{children:"https://builds.apache.org/job/HBase-PreCommit-GitHub-PR/job/PR-289/1/console"}),`).
This will take you to `,e.jsx(t.code,{children:"builds.apache.org"}),`, to the build run that failed. See the
"breadcrumbs" along the top (where breadcrumbs is the listing of the directories that
gets us to this particular build page). It'll look something like
`,e.jsx(t.code,{children:"Jenkins > HBase-PreCommit-GitHub-PR > PR-289 > #1"}),`. Click on the
PR number — i.e. PR-289 in our example — and then, when you've arrived at the PR page,
find the 'Build with Parameters' menu-item (along top left-hand menu). Click here and
then `,e.jsx(t.code,{children:"Build"})," leaving the JIRA_ISSUE_KEY empty. This will re-run your checks."]}),`
`,e.jsx(t.h3,{id:"dialog",children:"Dialog"}),`
`,e.jsx(t.p,{children:`Committers should hang out in the #hbase room on irc.freenode.net for real-time discussions.
However any substantive discussion (as with any off-list project-related discussion) should be re-iterated in Jira or on the developer list.`}),`
`,e.jsx(t.h3,{id:"do-not-edit-jira-comments",children:"Do not edit JIRA comments"}),`
`,e.jsx(t.p,{children:"Misspellings and/or bad grammar is preferable to the disruption a JIRA comment edit."}),`
`,e.jsx(t.h2,{id:"the-hbase-thirdparty-dependency-and-shadingrelocation",children:"The hbase-thirdparty dependency and shading/relocation"}),`
`,e.jsxs(t.p,{children:[`A new project was created for the release of hbase-2.0.0. It was called
`,e.jsx(t.code,{children:"hbase-thirdparty"}),`. This project exists only to provide the main hbase
project with relocated — or shaded — versions of popular thirdparty
libraries such as guava, netty, and protobuf. The mainline HBase project
relies on the relocated versions of these libraries gotten from hbase-thirdparty
rather than on finding these classes in their usual locations. We do this so
we can specify whatever the version we wish. If we don't relocate, we must
harmonize our version to match that which hadoop, spark, and other projects use.`]}),`
`,e.jsxs(t.p,{children:[`For developers, this means you need to be careful referring to classes from
netty, guava, protobuf, gson, etc. (see the hbase-thirdparty pom.xml for what
it provides). Devs must refer to the hbase-thirdparty provided classes. In
practice, this is usually not an issue (though it can be a bit of a pain). You
will have to hunt for the relocated version of your particular class. You'll
find it by prepending the general relocation prefix of `,e.jsx(t.code,{children:"org.apache.hbase.thirdparty."}),`.
For example if you are looking for `,e.jsx(t.code,{children:"com.google.protobuf.Message"}),`, the relocated
version used by HBase internals can be found at
`,e.jsx(t.code,{children:"org.apache.hbase.thirdparty.com.google.protobuf.Message"}),"."]}),`
`,e.jsxs(t.p,{children:[`For a few thirdparty libs, like protobuf (see the protobuf chapter in this book
for the why), your IDE may give you both options — the `,e.jsx(t.code,{children:"com.google.protobuf.*"}),`
and the `,e.jsx(t.code,{children:"org.apache.hbase.thirdparty.com.google.protobuf.*"}),` — because both
classes are on your CLASSPATH. Unless you are doing the particular juggling
required in Coprocessor Endpoint development (again see above cited protobuf
chapter), you'll want to use the shaded version, always.`]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"hbase-thirdparty"})," project has groupid of ",e.jsx(t.code,{children:"org.apache.hbase.thirdparty"}),`.
As of this writing, it provides three jars; one for netty with an artifactid of
`,e.jsx(t.code,{children:"hbase-thirdparty-netty"}),", one for protobuf at ",e.jsx(t.code,{children:"hbase-thirdparty-protobuf"}),` and then
a jar for all else — gson, guava — at `,e.jsx(t.code,{children:"hbase-thirdpaty-miscellaneous"}),"."]}),`
`,e.jsx(t.p,{children:`The hbase-thirdparty artifacts are a product produced by the Apache HBase
project under the aegis of the HBase Project Management Committee. Releases
are done via the usual voting project on the hbase dev mailing list. If issue
in the hbase-thirdparty, use the hbase JIRA and mailing lists to post notice.`}),`
`,e.jsx(t.h2,{id:"development-of-hbase-related-maven-archetypes",children:"Development of HBase-related Maven archetypes"}),`
`,e.jsxs(t.p,{children:[`The development of HBase-related Maven archetypes was begun with
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-14876",children:"HBASE-14876"}),`.
For an overview of the hbase-archetypes infrastructure and instructions
for developing new HBase-related Maven archetypes, please see
`,e.jsx(t.code,{children:"hbase/hbase-archetypes/README.md"}),"."]})]})}function p(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(r,{...i})}):r(i)}function a(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as _markdown,p as default,d as extractedReferences,l as frontmatter,u as structuredData,m as toc};
