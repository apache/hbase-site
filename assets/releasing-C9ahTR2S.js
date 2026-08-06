import{j as e}from"./components-BCHf_v1I.js";let o=`<Callout type="info" title="Building against HBase 1.x">
  See old refguides for how to build HBase 1.x. The below is for building hbase2.
</Callout>

## Making a Release Candidate

Only committers can make releases of hbase artifacts.

**Before You Begin**

Check to be sure recent builds have been passing for the branch from where you
are going to take your release. You should also have tried recent branch tips
out on a cluster under load, perhaps by running the \`hbase-it\` integration test
suite for a few hours to 'burn in' the near-candidate bits.

You will need a published signing key added to the hbase
[KEYS](https://dist.apache.org/repos/dist/release/hbase/KEYS) file.
(For how to add a KEY, see *Step 1.* in [How To Release](https://cwiki.apache.org/confluence/display/HADOOP2/HowToRelease),
the Hadoop version of this document).

Next make sure JIRA is properly primed, that all issues targeted against
the prospective release have been resolved and are present in git on the
particular branch. If any outstanding issues, move them out of the release by
adjusting the fix version to remove this pending release as a target.
Any JIRA with a fix version that matches the release candidate
target release will be included in the generated *CHANGES.md/RELEASENOTES.md*
files that ship with the release so make sure JIRA is correct before you begin.

After doing the above, you can move to the manufacture of an RC.

Building an RC is involved so we've scripted it. The script builds in a Docker
container to ensure we have a consistent environment building. It will ask you
for passwords for apache and for your gpg signing key so it can sign and commit
on your behalf. The passwords are passed to gpg-agent in the container and
purged along with the container when the build is done.

The script will:

* Set version to the release version
* Updates RELEASENOTES.md and CHANGES.md
* Tag the RC
* Set version to next SNAPSHOT version.
* Builds, signs, and hashes all artifacts.
* Generates the api compatibility report
* Pushes release tgzs to the dev dir in a apache dist.
* Pushes to repository.apache.org staging.
* Creates vote email template.

The *dev-support/create-release/do-release-docker.sh* Release Candidate (RC)
Generating script is maintained in the master branch but can generate RCs
for any 2.x+ branch (The script does not work against branch-1). Check out
and update the master branch when making RCs. See
*dev-support/create-release/README.txt* for how to configure your
environment and run the script.

<Callout type="info">
  *dev-support/create-release/do-release-docker.sh* supercedes the previous *dev-support/make\\_rc.sh*
  script. It is more comprehensive automating all steps, rather than a portion, building a RC.
</Callout>

### Release Candidate Procedure

Here we outline the steps involved generating a Release Candidate, the steps
automated by the *dev-support/create-release/do-release-docker.sh* script
described in the previous section. Running these steps manually tends to
be error-prone so is not recommended. The below is informational only.

The process below makes use of various tools, mainly *git* and *maven*.

<Callout type="info" title="Specifying the Heap Space for Maven">
  You may run into OutOfMemoryErrors building, particularly building the site and
  documentation. Up the heap for Maven by setting the \`MAVEN_OPTS\` variable.
  You can prefix the variable to the Maven command, as in the following example:

  \`\`\`bash
  MAVEN_OPTS="-Xmx4g -XX:MaxPermSize=256m" mvn package
  \`\`\`

  You could also set this in an environment variable or alias in your shell.
</Callout>

<Steps>
  <Step>
    #### Example *\\~/.m2/settings.xml* File

    Publishing to maven requires you sign the artifacts you want to upload.
    For the build to sign them for you, you a properly configured *settings.xml*
    in your local repository under *.m2*, such as the following.

    \`\`\`xml
    <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                          http://maven.apache.org/xsd/settings-1.0.0.xsd">
      <servers>
        <!- To publish a snapshot of some part of Maven -->
        <server>
          <id>apache.snapshots.https</id>
          <username>YOUR_APACHE_ID
          </username>
          <password>YOUR_APACHE_PASSWORD
          </password>
        </server>
        <!-- To publish a website using Maven -->
        <!-- To stage a release of some part of Maven -->
        <server>
          <id>apache.releases.https</id>
          <username>YOUR_APACHE_ID
          </username>
          <password>YOUR_APACHE_PASSWORD
          </password>
        </server>
      </servers>
      <profiles>
        <profile>
          <id>apache-release</id>
          <properties>
        <gpg.keyname>YOUR_KEYNAME</gpg.keyname>
        <!--Keyname is something like this ... 00A5F21E... do \`gpg ——list-keys\` to find it-->
        <gpg.passphrase>YOUR_KEY_PASSWORD
        </gpg.passphrase>
          </properties>
        </profile>
      </profiles>
    </settings>
    \`\`\`
  </Step>

  <Step>
    #### Update the *CHANGES.md* and *RELEASENOTES.md* files and the POM files.

    Update *CHANGES.md* with the changes since the last release. Be careful with where you put
    headings and license. Respect the instructions and warning you find in current
    *CHANGES.md* and *RELEASENOTES.md* since these two files are processed by tooling that is
    looking for particular string sequences. See [HBASE-21399](https://issues.apache.org/jira/browse/HBASE-21399)
    for description on how to make use of yetus generating additions to
    *CHANGES.md* and *RELEASENOTES.md* (RECOMMENDED!). Adding JIRA fixes, make sure the
    URL to the JIRA points to the proper location which lists fixes for this release.

    Next, adjust the version in all the POM files appropriately.
    If you are making a release candidate, you must remove the \`-SNAPSHOT\` label from all versions
    in all pom.xml files.
    If you are running this receipe to publish a snapshot, you must keep the \`-SNAPSHOT\` suffix on the hbase version.
    The [Versions Maven Plugin](http://www.mojohaus.org/versions-maven-plugin/) can be of use here.
    To set a version in all the many poms of the hbase multi-module project, use a command like the following:

    \`\`\`bash
    $ mvn clean org.codehaus.mojo:versions-maven-plugin:2.5:set -DnewVersion=2.1.0-SNAPSHOT
    \`\`\`

    Make sure all versions in poms are changed! Checkin the *CHANGES.md*, *RELEASENOTES.md*, and
    any maven version changes.
  </Step>

  <Step>
    #### Update the documentation.

    Update the documentation under *hbase-website/app/page/\\_docs/docs/\\_mdx/(multi-page)*.
    This usually involves copying the latest from master branch and making version-particular
    adjustments to suit this release candidate version. Commit your changes.
  </Step>

  <Step>
    #### Clean the checkout dir

    \`\`\`bash
    $ mvn clean
    $ git clean -f -x -d
    \`\`\`
  </Step>

  <Step>
    #### Run Apache-Rat

    Check licenses are good

    \`\`\`bash
    $ mvn apache-rat:check
    \`\`\`

    If the above fails, check the rat log.

    \`\`\`bash
    $ grep 'Rat check' patchprocess/mvn_apache_rat.log
    \`\`\`
  </Step>

  <Step>
    #### Create a release tag.

    Presuming you have run basic tests, the rat check, passes and all is
    looking good, now is the time to tag the release candidate (You
    always remove the tag if you need to redo). To tag, do
    what follows substituting in the version appropriate to your build.
    All tags should be signed tags; i.e. pass the *-s* option (See
    [Signing Your Work](https://git-scm.com/book/id/v2/Git-Tools-Signing-Your-Work)
    for how to set up your git environment for signing).

    \`\`\`bash
    $ git tag -s 2.0.0-alpha4-RC0 -m "Tagging the 2.0.0-alpha4 first Releae Candidate (Candidates start at zero)"
    \`\`\`

    Or, if you are making a release, tags should have a *rel/* prefix to ensure
    they are preserved in the Apache repo as in:

    \`\`\`bash
    +$ git tag -s rel/2.0.0-alpha4 -m "Tagging the 2.0.0-alpha4 Release"
    \`\`\`

    Push the (specific) tag (only) so others have access.

    \`\`\`bash
    $ git push origin 2.0.0-alpha4-RC0
    \`\`\`

    For how to delete tags, see
    [How to Delete a Tag](http://www.manikrathee.com/how-to-delete-a-tag-in-git.html). Covers
    deleting tags that have not yet been pushed to the remote Apache
    repo as well as delete of tags pushed to Apache.
  </Step>

  <Step>
    #### Build the source tarball.

    Now, build the source tarball. Lets presume we are building the source
    tarball for the tag *2.0.0-alpha4-RC0* into */tmp/hbase-2.0.0-alpha4-RC0/*
    (This step requires that the mvn and git clean steps described above have just been done).

    \`\`\`bash
    $ git archive --format=tar.gz --output="/tmp/hbase-2.0.0-alpha4-RC0/hbase-2.0.0-alpha4-src.tar.gz" --prefix="hbase-2.0.0-alpha4/" $git_tag
    \`\`\`

    Above we generate the hbase-2.0.0-alpha4-src.tar.gz tarball into the
    */tmp/hbase-2.0.0-alpha4-RC0* build output directory (We don't want the *RC0* in the name or prefix.
    These bits are currently a release candidate but if the VOTE passes, they will become the release so we do not taint
    the artifact names with *RCX*).
  </Step>

  <Step>
    #### Build the binary tarball.

    Next, build the binary tarball. Add the \`-Prelease\` profile when building.
    It runs the license apache-rat check among other rules that help ensure
    all is wholesome. Do it in two steps.

    First install into the local repository

    \`\`\`bash
    $ mvn clean install -DskipTests -Prelease
    \`\`\`

    Next, generate documentation and assemble the tarball. Be warned,
    this next step can take a good while, a couple of hours generating site
    documentation.

    \`\`\`bash
    $ mvn install -DskipTests site assembly:single -Prelease
    \`\`\`

    Otherwise, the build complains that hbase modules are not in the maven repository
    when you try to do it all in one step, especially on a fresh repository.
    It seems that you need the install goal in both steps.

    Extract the generated tarball — you'll find it under
    *hbase-assembly/target* and check it out.
    Look at the documentation, see if it runs, etc.
    If good, copy the tarball beside the source tarball in the
    build output directory.
  </Step>

  <Step>
    #### Deploy to the Maven Repository.

    Next, deploy HBase to the Apache Maven repository. Add the
    apache-release\`profile when running the\`mvn deploy\\\` command.
    This profile comes from the Apache parent pom referenced by our pom files.
    It does signing of your artifacts published to Maven, as long as the
    *settings.xml* is configured correctly, as described in [Example \\~/.m2/settings.xml File](/docs/building-and-developing/releasing#example-m2settingsxml-file).
    This step depends on the local repository having been populate
    by the just-previous bin tarball build.

    \`\`\`bash
    $ mvn deploy -DskipTests -Papache-release -Prelease
    \`\`\`

    This command copies all artifacts up to a temporary staging Apache mvn repository in an 'open' state.
    More work needs to be done on these maven artifacts to make them generally available.

    We do not release HBase tarball to the Apache Maven repository. To avoid deploying the tarball, do not
    include the \`assembly:single\` goal in your \`mvn deploy\` command. Check the deployed artifacts as described in the next section.

    <Callout type="info" title="make_rc.sh">
      If you ran the old *dev-support/make\\_rc.sh* script, this is as far as it takes you. To finish the
      release, take up the script from here on out.
    </Callout>
  </Step>

  <Step>
    #### Make the Release Candidate available.

    The artifacts are in the maven repository in the staging area in the 'open' state.
    While in this 'open' state you can check out what you've published to make sure all is good.
    To do this, log in to Apache's Nexus at [repository.apache.org](https://repository.apache.org) using your Apache ID.
    Find your artifacts in the staging repository. Click on 'Staging Repositories' and look for a new one ending in "hbase" with a status of 'Open', select it.
    Use the tree view to expand the list of repository contents and inspect if the artifacts you expect are present. Check the POMs.
    As long as the staging repo is open you can re-upload if something is missing or built incorrectly.

    If something is seriously wrong and you would like to back out the upload, you can use the 'Drop' button to drop and delete the staging repository.
    Sometimes the upload fails in the middle. This is another reason you might have to 'Drop' the upload from the staging repository.

    If it checks out, close the repo using the 'Close' button. The repository must be closed before a public URL to it becomes available. It may take a few minutes for the repository to close. Once complete you'll see a public URL to the repository in the Nexus UI. You may also receive an email with the URL. Provide the URL to the temporary staging repository in the email that announces the release candidate.
    (Folks will need to add this repo URL to their local poms or to their local *settings.xml* file to pull the published release candidate artifacts.)

    When the release vote concludes successfully, return here and click the 'Release' button to release the artifacts to central. The release process will automatically drop and delete the staging repository.

    <Callout type="info" title="hbase-downstreamer">
      See the [hbase-downstreamer](https://github.com/saintstack/hbase-downstreamer) test for a simple
      example of a project that is downstream of HBase an depends on it. Check it out and run its simple
      test to make sure maven artifacts are properly deployed to the maven repository. Be sure to edit
      the pom to point to the proper staging repository. Make sure you are pulling from the repository
      when tests run and that you are not getting from your local repository, by either passing the \`-U\`
      flag or deleting your local repo content and check maven is pulling from remote out of the staging
      repository.
    </Callout>

    See [Publishing Maven Artifacts](https://www.apache.org/dev/publishing-maven-artifacts.html) for some pointers on this maven staging process.

    If the HBase version ends in \`-SNAPSHOT\`, the artifacts go elsewhere.
    They are put into the Apache snapshots repository directly and are immediately available.
    Making a SNAPSHOT release, this is what you want to happen.

    At this stage, you have two tarballs in your 'build output directory' and a set of artifacts
    in a staging area of the maven repository, in the 'closed' state.
    Next sign, fingerprint and then 'stage' your release candiate build output directory via svnpubsub by committing
    your directory to [The dev distribution directory](https://dist.apache.org/repos/dist/dev/hbase/)
    (See comments on [HBASE-10554 Please delete old releases from mirroring system](https://issues.apache.org/jira/browse/HBASE-10554)
    but in essence it is an svn checkout of [dev/hbase](https://dist.apache.org/repos/dist/dev/hbase) — releases are at
    [release/hbase](https://dist.apache.org/repos/dist/release/hbase)). In the *version directory* run the following commands:

    \`\`\`bash
    $ for i in *.tar.gz; do echo $i; gpg --print-md MD5 $i > $i.md5 ; done
    $ for i in *.tar.gz; do echo $i; gpg --print-md SHA512 $i > $i.sha ; done
    $ for i in *.tar.gz; do echo $i; gpg --armor --output $i.asc --detach-sig $i  ; done
    $ cd ..
    # Presuming our 'build output directory' is named 0.96.0RC0, copy it to the svn checkout of the dist dev dir
    # in this case named hbase.dist.dev.svn
    $ cd /Users/stack/checkouts/hbase.dist.dev.svn
    $ svn info
    Path: .
    Working Copy Root Path: /Users/stack/checkouts/hbase.dist.dev.svn
    URL: https://dist.apache.org/repos/dist/dev/hbase
    Repository Root: https://dist.apache.org/repos/dist
    Repository UUID: 0d268c88-bc11-4956-87df-91683dc98e59
    Revision: 15087
    Node Kind: directory
    Schedule: normal
    Last Changed Author: ndimiduk
    Last Changed Rev: 15045
    Last Changed Date: 2016-08-28 11:13:36 -0700 (Sun, 28 Aug 2016)
    $ mv 0.96.0RC0 /Users/stack/checkouts/hbase.dist.dev.svn
    $ svn add 0.96.0RC0
    $ svn commit ...
    \`\`\`

    Ensure it actually gets published by checking [https://dist.apache.org/repos/dist/dev/hbase/](https://dist.apache.org/repos/dist/dev/hbase/).

    Announce the release candidate on the mailing list and call a vote.
  </Step>
</Steps>

### Publishing a SNAPSHOT to maven

Make sure your *settings.xml* is set up properly (see [Example \\~/.m2/settings.xml File](/docs/building-and-developing/releasing#example-m2settingsxml-file)).
Make sure the hbase version includes \`-SNAPSHOT\` as a suffix.
Following is an example of publishing SNAPSHOTS of a release that had an hbase version of 0.96.0 in its poms.

\`\`\`bash
$ mvn clean install -DskipTests  javadoc:aggregate site assembly:single -Prelease
$ mvn -DskipTests  deploy -Papache-release
\`\`\`

The *make\\_rc.sh* script mentioned above (see [Making a Release Candidate](/docs/building-and-developing/releasing#making-a-release-candidate)) can help you publish \`SNAPSHOTS\`.
Make sure your \`hbase.version\` has a \`-SNAPSHOT\` suffix before running the script.
It will put a snapshot up into the apache snapshot repository for you.
`,d={title:"Releasing Apache HBase",description:"Complete guide to creating HBase release candidates including building, signing, staging artifacts, and publishing releases."},c=[{href:"https://dist.apache.org/repos/dist/release/hbase/KEYS"},{href:"https://cwiki.apache.org/confluence/display/HADOOP2/HowToRelease"},{href:"https://issues.apache.org/jira/browse/HBASE-21399"},{href:"http://www.mojohaus.org/versions-maven-plugin/"},{href:"https://git-scm.com/book/id/v2/Git-Tools-Signing-Your-Work"},{href:"http://www.manikrathee.com/how-to-delete-a-tag-in-git.html"},{href:"/docs/building-and-developing/releasing#example-m2settingsxml-file"},{href:"https://repository.apache.org"},{href:"https://github.com/saintstack/hbase-downstreamer"},{href:"https://www.apache.org/dev/publishing-maven-artifacts.html"},{href:"https://dist.apache.org/repos/dist/dev/hbase/"},{href:"https://issues.apache.org/jira/browse/HBASE-10554"},{href:"https://dist.apache.org/repos/dist/dev/hbase"},{href:"https://dist.apache.org/repos/dist/release/hbase"},{href:"https://dist.apache.org/repos/dist/dev/hbase/"},{href:"/docs/building-and-developing/releasing#example-m2settingsxml-file"},{href:"/docs/building-and-developing/releasing#making-a-release-candidate"}],p={contents:[{heading:void 0,content:"See old refguides for how to build HBase 1.x. The below is for building hbase2."},{heading:"making-a-release-candidate",content:"Only committers can make releases of hbase artifacts."},{heading:"making-a-release-candidate",content:"**Before You Begin**"},{heading:"making-a-release-candidate",content:`Check to be sure recent builds have been passing for the branch from where you
are going to take your release. You should also have tried recent branch tips
out on a cluster under load, perhaps by running the \`hbase-it\` integration test
suite for a few hours to 'burn in' the near-candidate bits.`},{heading:"making-a-release-candidate",content:`You will need a published signing key added to the hbase
KEYS file.
(For how to add a KEY, see &#x2A;Step 1.* in How To Release,
the Hadoop version of this document).`},{heading:"making-a-release-candidate",content:`Next make sure JIRA is properly primed, that all issues targeted against
the prospective release have been resolved and are present in git on the
particular branch. If any outstanding issues, move them out of the release by
adjusting the fix version to remove this pending release as a target.
Any JIRA with a fix version that matches the release candidate
target release will be included in the generated *CHANGES.md/RELEASENOTES.md*
files that ship with the release so make sure JIRA is correct before you begin.`},{heading:"making-a-release-candidate",content:"After doing the above, you can move to the manufacture of an RC."},{heading:"making-a-release-candidate",content:`Building an RC is involved so we've scripted it. The script builds in a Docker
container to ensure we have a consistent environment building. It will ask you
for passwords for apache and for your gpg signing key so it can sign and commit
on your behalf. The passwords are passed to gpg-agent in the container and
purged along with the container when the build is done.`},{heading:"making-a-release-candidate",content:"The script will:"},{heading:"making-a-release-candidate",content:"Set version to the release version"},{heading:"making-a-release-candidate",content:"Updates RELEASENOTES.md and CHANGES.md"},{heading:"making-a-release-candidate",content:"Tag the RC"},{heading:"making-a-release-candidate",content:"Set version to next SNAPSHOT version."},{heading:"making-a-release-candidate",content:"Builds, signs, and hashes all artifacts."},{heading:"making-a-release-candidate",content:"Generates the api compatibility report"},{heading:"making-a-release-candidate",content:"Pushes release tgzs to the dev dir in a apache dist."},{heading:"making-a-release-candidate",content:"Pushes to repository.apache.org staging."},{heading:"making-a-release-candidate",content:"Creates vote email template."},{heading:"making-a-release-candidate",content:`The *dev-support/create-release/do-release-docker.sh* Release Candidate (RC)
Generating script is maintained in the master branch but can generate RCs
for any 2.x+ branch (The script does not work against branch-1). Check out
and update the master branch when making RCs. See
*dev-support/create-release/README.txt* for how to configure your
environment and run the script.`},{heading:"making-a-release-candidate",content:`*dev-support/create-release/do-release-docker.sh* supercedes the previous *dev-support/make\\_rc.sh*
script. It is more comprehensive automating all steps, rather than a portion, building a RC.`},{heading:"release-candidate-procedure",content:`Here we outline the steps involved generating a Release Candidate, the steps
automated by the *dev-support/create-release/do-release-docker.sh* script
described in the previous section. Running these steps manually tends to
be error-prone so is not recommended. The below is informational only.`},{heading:"release-candidate-procedure",content:"The process below makes use of various tools, mainly *git* and *maven*."},{heading:"release-candidate-procedure",content:"You may run into OutOfMemoryErrors building, particularly building the site and\ndocumentation. Up the heap for Maven by setting the `MAVEN_OPTS` variable.\nYou can prefix the variable to the Maven command, as in the following example:"},{heading:"release-candidate-procedure",content:"You could also set this in an environment variable or alias in your shell."},{heading:"example-m2settingsxml-file",content:`Publishing to maven requires you sign the artifacts you want to upload.
For the build to sign them for you, you a properly configured *settings.xml&#x2A;
in your local repository under *.m2*, such as the following.`},{heading:"update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",content:`Update *CHANGES.md* with the changes since the last release. Be careful with where you put
headings and license. Respect the instructions and warning you find in current
*CHANGES.md* and *RELEASENOTES.md* since these two files are processed by tooling that is
looking for particular string sequences. See HBASE-21399
for description on how to make use of yetus generating additions to
*CHANGES.md* and *RELEASENOTES.md* (RECOMMENDED!). Adding JIRA fixes, make sure the
URL to the JIRA points to the proper location which lists fixes for this release.`},{heading:"update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",content:`Next, adjust the version in all the POM files appropriately.
If you are making a release candidate, you must remove the \`-SNAPSHOT\` label from all versions
in all pom.xml files.
If you are running this receipe to publish a snapshot, you must keep the \`-SNAPSHOT\` suffix on the hbase version.
The Versions Maven Plugin can be of use here.
To set a version in all the many poms of the hbase multi-module project, use a command like the following:`},{heading:"update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",content:`Make sure all versions in poms are changed! Checkin the *CHANGES.md*, *RELEASENOTES.md*, and
any maven version changes.`},{heading:"update-the-documentation",content:`Update the documentation under &#x2A;hbase-website/app/page/\\_docs/docs/\\_mdx/(multi-page)*.
This usually involves copying the latest from master branch and making version-particular
adjustments to suit this release candidate version. Commit your changes.`},{heading:"run-apache-rat",content:"Check licenses are good"},{heading:"run-apache-rat",content:"If the above fails, check the rat log."},{heading:"create-a-release-tag",content:`Presuming you have run basic tests, the rat check, passes and all is
looking good, now is the time to tag the release candidate (You
always remove the tag if you need to redo). To tag, do
what follows substituting in the version appropriate to your build.
All tags should be signed tags; i.e. pass the *-s* option (See
Signing Your Work
for how to set up your git environment for signing).`},{heading:"create-a-release-tag",content:`Or, if you are making a release, tags should have a &#x2A;rel/* prefix to ensure
they are preserved in the Apache repo as in:`},{heading:"create-a-release-tag",content:"Push the (specific) tag (only) so others have access."},{heading:"create-a-release-tag",content:`For how to delete tags, see
How to Delete a Tag. Covers
deleting tags that have not yet been pushed to the remote Apache
repo as well as delete of tags pushed to Apache.`},{heading:"build-the-source-tarball",content:`Now, build the source tarball. Lets presume we are building the source
tarball for the tag *2.0.0-alpha4-RC0&#x2A; into &#x2A;/tmp/hbase-2.0.0-alpha4-RC0/*
(This step requires that the mvn and git clean steps described above have just been done).`},{heading:"build-the-source-tarball",content:`Above we generate the hbase-2.0.0-alpha4-src.tar.gz tarball into the
*/tmp/hbase-2.0.0-alpha4-RC0* build output directory (We don't want the *RC0* in the name or prefix.
These bits are currently a release candidate but if the VOTE passes, they will become the release so we do not taint
the artifact names with *RCX*).`},{heading:"build-the-binary-tarball",content:"Next, build the binary tarball. Add the `-Prelease` profile when building.\nIt runs the license apache-rat check among other rules that help ensure\nall is wholesome. Do it in two steps."},{heading:"build-the-binary-tarball",content:"First install into the local repository"},{heading:"build-the-binary-tarball",content:`Next, generate documentation and assemble the tarball. Be warned,
this next step can take a good while, a couple of hours generating site
documentation.`},{heading:"build-the-binary-tarball",content:`Otherwise, the build complains that hbase modules are not in the maven repository
when you try to do it all in one step, especially on a fresh repository.
It seems that you need the install goal in both steps.`},{heading:"build-the-binary-tarball",content:`Extract the generated tarball — you'll find it under
*hbase-assembly/target* and check it out.
Look at the documentation, see if it runs, etc.
If good, copy the tarball beside the source tarball in the
build output directory.`},{heading:"deploy-to-the-maven-repository",content:`Next, deploy HBase to the Apache Maven repository. Add the
apache-release\`profile when running the\`mvn deploy\\\` command.
This profile comes from the Apache parent pom referenced by our pom files.
It does signing of your artifacts published to Maven, as long as the
*settings.xml* is configured correctly, as described in Example \\~/.m2/settings.xml File.
This step depends on the local repository having been populate
by the just-previous bin tarball build.`},{heading:"deploy-to-the-maven-repository",content:`This command copies all artifacts up to a temporary staging Apache mvn repository in an 'open' state.
More work needs to be done on these maven artifacts to make them generally available.`},{heading:"deploy-to-the-maven-repository",content:"We do not release HBase tarball to the Apache Maven repository. To avoid deploying the tarball, do not\ninclude the `assembly:single` goal in your `mvn deploy` command. Check the deployed artifacts as described in the next section."},{heading:"deploy-to-the-maven-repository",content:`If you ran the old *dev-support/make\\_rc.sh* script, this is as far as it takes you. To finish the
release, take up the script from here on out.`},{heading:"make-the-release-candidate-available",content:`The artifacts are in the maven repository in the staging area in the 'open' state.
While in this 'open' state you can check out what you've published to make sure all is good.
To do this, log in to Apache's Nexus at repository.apache.org using your Apache ID.
Find your artifacts in the staging repository. Click on 'Staging Repositories' and look for a new one ending in "hbase" with a status of 'Open', select it.
Use the tree view to expand the list of repository contents and inspect if the artifacts you expect are present. Check the POMs.
As long as the staging repo is open you can re-upload if something is missing or built incorrectly.`},{heading:"make-the-release-candidate-available",content:`If something is seriously wrong and you would like to back out the upload, you can use the 'Drop' button to drop and delete the staging repository.
Sometimes the upload fails in the middle. This is another reason you might have to 'Drop' the upload from the staging repository.`},{heading:"make-the-release-candidate-available",content:`If it checks out, close the repo using the 'Close' button. The repository must be closed before a public URL to it becomes available. It may take a few minutes for the repository to close. Once complete you'll see a public URL to the repository in the Nexus UI. You may also receive an email with the URL. Provide the URL to the temporary staging repository in the email that announces the release candidate.
(Folks will need to add this repo URL to their local poms or to their local *settings.xml* file to pull the published release candidate artifacts.)`},{heading:"make-the-release-candidate-available",content:"When the release vote concludes successfully, return here and click the 'Release' button to release the artifacts to central. The release process will automatically drop and delete the staging repository."},{heading:"make-the-release-candidate-available",content:`See the hbase-downstreamer test for a simple
example of a project that is downstream of HBase an depends on it. Check it out and run its simple
test to make sure maven artifacts are properly deployed to the maven repository. Be sure to edit
the pom to point to the proper staging repository. Make sure you are pulling from the repository
when tests run and that you are not getting from your local repository, by either passing the \`-U\`
flag or deleting your local repo content and check maven is pulling from remote out of the staging
repository.`},{heading:"make-the-release-candidate-available",content:"See Publishing Maven Artifacts for some pointers on this maven staging process."},{heading:"make-the-release-candidate-available",content:"If the HBase version ends in `-SNAPSHOT`, the artifacts go elsewhere.\nThey are put into the Apache snapshots repository directly and are immediately available.\nMaking a SNAPSHOT release, this is what you want to happen."},{heading:"make-the-release-candidate-available",content:`At this stage, you have two tarballs in your 'build output directory' and a set of artifacts
in a staging area of the maven repository, in the 'closed' state.
Next sign, fingerprint and then 'stage' your release candiate build output directory via svnpubsub by committing
your directory to The dev distribution directory
(See comments on HBASE-10554 Please delete old releases from mirroring system
but in essence it is an svn checkout of dev/hbase — releases are at
release/hbase). In the *version directory* run the following commands:`},{heading:"make-the-release-candidate-available",content:"Ensure it actually gets published by checking https\\://dist.apache.org/repos/dist/dev/hbase/."},{heading:"make-the-release-candidate-available",content:"Announce the release candidate on the mailing list and call a vote."},{heading:"publishing-a-snapshot-to-maven",content:"Make sure your *settings.xml* is set up properly (see Example \\~/.m2/settings.xml File).\nMake sure the hbase version includes `-SNAPSHOT` as a suffix.\nFollowing is an example of publishing SNAPSHOTS of a release that had an hbase version of 0.96.0 in its poms."},{heading:"publishing-a-snapshot-to-maven",content:"The *make\\_rc.sh* script mentioned above (see Making a Release Candidate) can help you publish `SNAPSHOTS`.\nMake sure your `hbase.version` has a `-SNAPSHOT` suffix before running the script.\nIt will put a snapshot up into the apache snapshot repository for you."}],headings:[{id:"making-a-release-candidate",content:"Making a Release Candidate"},{id:"release-candidate-procedure",content:"Release Candidate Procedure"},{id:"example-m2settingsxml-file",content:"Example *~/.m2/settings.xml* File"},{id:"update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",content:"Update the *CHANGES.md* and *RELEASENOTES.md* files and the POM files."},{id:"update-the-documentation",content:"Update the documentation."},{id:"clean-the-checkout-dir",content:"Clean the checkout dir"},{id:"run-apache-rat",content:"Run Apache-Rat"},{id:"create-a-release-tag",content:"Create a release tag."},{id:"build-the-source-tarball",content:"Build the source tarball."},{id:"build-the-binary-tarball",content:"Build the binary tarball."},{id:"deploy-to-the-maven-repository",content:"Deploy to the Maven Repository."},{id:"make-the-release-candidate-available",content:"Make the Release Candidate available."},{id:"publishing-a-snapshot-to-maven",content:"Publishing a SNAPSHOT to maven"}]},g=[{depth:2,url:"#making-a-release-candidate",title:e.jsx(e.Fragment,{children:"Making a Release Candidate"})},{depth:3,url:"#release-candidate-procedure",title:e.jsx(e.Fragment,{children:"Release Candidate Procedure"})},{depth:4,url:"#example-m2settingsxml-file",title:e.jsxs(e.Fragment,{children:["Example ",e.jsx("em",{children:"~/.m2/settings.xml"})," File"]})},{depth:4,url:"#update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",title:e.jsxs(e.Fragment,{children:["Update the ",e.jsx("em",{children:"CHANGES.md"})," and ",e.jsx("em",{children:"RELEASENOTES.md"})," files and the POM files."]})},{depth:4,url:"#update-the-documentation",title:e.jsx(e.Fragment,{children:"Update the documentation."})},{depth:4,url:"#clean-the-checkout-dir",title:e.jsx(e.Fragment,{children:"Clean the checkout dir"})},{depth:4,url:"#run-apache-rat",title:e.jsx(e.Fragment,{children:"Run Apache-Rat"})},{depth:4,url:"#create-a-release-tag",title:e.jsx(e.Fragment,{children:"Create a release tag."})},{depth:4,url:"#build-the-source-tarball",title:e.jsx(e.Fragment,{children:"Build the source tarball."})},{depth:4,url:"#build-the-binary-tarball",title:e.jsx(e.Fragment,{children:"Build the binary tarball."})},{depth:4,url:"#deploy-to-the-maven-repository",title:e.jsx(e.Fragment,{children:"Deploy to the Maven Repository."})},{depth:4,url:"#make-the-release-candidate-available",title:e.jsx(e.Fragment,{children:"Make the Release Candidate available."})},{depth:3,url:"#publishing-a-snapshot-to-maven",title:e.jsx(e.Fragment,{children:"Publishing a SNAPSHOT to maven"})}];function r(t){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components},{Callout:a,Step:i,Steps:h}=s;return a||n("Callout"),i||n("Step"),h||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(a,{type:"info",title:"Building against HBase 1.x",children:e.jsx(s.p,{children:"See old refguides for how to build HBase 1.x. The below is for building hbase2."})}),`
`,e.jsx(s.h2,{id:"making-a-release-candidate",children:"Making a Release Candidate"}),`
`,e.jsx(s.p,{children:"Only committers can make releases of hbase artifacts."}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Before You Begin"})}),`
`,e.jsxs(s.p,{children:[`Check to be sure recent builds have been passing for the branch from where you
are going to take your release. You should also have tried recent branch tips
out on a cluster under load, perhaps by running the `,e.jsx(s.code,{children:"hbase-it"}),` integration test
suite for a few hours to 'burn in' the near-candidate bits.`]}),`
`,e.jsxs(s.p,{children:[`You will need a published signing key added to the hbase
`,e.jsx(s.a,{href:"https://dist.apache.org/repos/dist/release/hbase/KEYS",children:"KEYS"}),` file.
(For how to add a KEY, see `,e.jsx(s.em,{children:"Step 1."})," in ",e.jsx(s.a,{href:"https://cwiki.apache.org/confluence/display/HADOOP2/HowToRelease",children:"How To Release"}),`,
the Hadoop version of this document).`]}),`
`,e.jsxs(s.p,{children:[`Next make sure JIRA is properly primed, that all issues targeted against
the prospective release have been resolved and are present in git on the
particular branch. If any outstanding issues, move them out of the release by
adjusting the fix version to remove this pending release as a target.
Any JIRA with a fix version that matches the release candidate
target release will be included in the generated `,e.jsx(s.em,{children:"CHANGES.md/RELEASENOTES.md"}),`
files that ship with the release so make sure JIRA is correct before you begin.`]}),`
`,e.jsx(s.p,{children:"After doing the above, you can move to the manufacture of an RC."}),`
`,e.jsx(s.p,{children:`Building an RC is involved so we've scripted it. The script builds in a Docker
container to ensure we have a consistent environment building. It will ask you
for passwords for apache and for your gpg signing key so it can sign and commit
on your behalf. The passwords are passed to gpg-agent in the container and
purged along with the container when the build is done.`}),`
`,e.jsx(s.p,{children:"The script will:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Set version to the release version"}),`
`,e.jsx(s.li,{children:"Updates RELEASENOTES.md and CHANGES.md"}),`
`,e.jsx(s.li,{children:"Tag the RC"}),`
`,e.jsx(s.li,{children:"Set version to next SNAPSHOT version."}),`
`,e.jsx(s.li,{children:"Builds, signs, and hashes all artifacts."}),`
`,e.jsx(s.li,{children:"Generates the api compatibility report"}),`
`,e.jsx(s.li,{children:"Pushes release tgzs to the dev dir in a apache dist."}),`
`,e.jsx(s.li,{children:"Pushes to repository.apache.org staging."}),`
`,e.jsx(s.li,{children:"Creates vote email template."}),`
`]}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.em,{children:"dev-support/create-release/do-release-docker.sh"}),` Release Candidate (RC)
Generating script is maintained in the master branch but can generate RCs
for any 2.x+ branch (The script does not work against branch-1). Check out
and update the master branch when making RCs. See
`,e.jsx(s.em,{children:"dev-support/create-release/README.txt"}),` for how to configure your
environment and run the script.`]}),`
`,e.jsx(a,{type:"info",children:e.jsxs(s.p,{children:[e.jsx(s.em,{children:"dev-support/create-release/do-release-docker.sh"})," supercedes the previous ",e.jsx(s.em,{children:"dev-support/make_rc.sh"}),`
script. It is more comprehensive automating all steps, rather than a portion, building a RC.`]})}),`
`,e.jsx(s.h3,{id:"release-candidate-procedure",children:"Release Candidate Procedure"}),`
`,e.jsxs(s.p,{children:[`Here we outline the steps involved generating a Release Candidate, the steps
automated by the `,e.jsx(s.em,{children:"dev-support/create-release/do-release-docker.sh"}),` script
described in the previous section. Running these steps manually tends to
be error-prone so is not recommended. The below is informational only.`]}),`
`,e.jsxs(s.p,{children:["The process below makes use of various tools, mainly ",e.jsx(s.em,{children:"git"})," and ",e.jsx(s.em,{children:"maven"}),"."]}),`
`,e.jsxs(a,{type:"info",title:"Specifying the Heap Space for Maven",children:[e.jsxs(s.p,{children:[`You may run into OutOfMemoryErrors building, particularly building the site and
documentation. Up the heap for Maven by setting the `,e.jsx(s.code,{children:"MAVEN_OPTS"}),` variable.
You can prefix the variable to the Maven command, as in the following example:`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"MAVEN_OPTS"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"-Xmx4g -XX:MaxPermSize=256m"'}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"})]})})})}),e.jsx(s.p,{children:"You could also set this in an environment variable or alias in your shell."})]}),`
`,e.jsxs(h,{children:[e.jsxs(i,{children:[e.jsxs(s.h4,{id:"example-m2settingsxml-file",children:["Example ",e.jsx(s.em,{children:"~/.m2/settings.xml"})," File"]}),e.jsxs(s.p,{children:[`Publishing to maven requires you sign the artifacts you want to upload.
For the build to sign them for you, you a properly configured `,e.jsx(s.em,{children:"settings.xml"}),`
in your local repository under `,e.jsx(s.em,{children:".m2"}),", such as the following."]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"settings"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" xmlns"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"http://maven.apache.org/SETTINGS/1.0.0"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  xmlns:xsi"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"http://www.w3.org/2001/XMLSchema-instance"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  xsi:schemaLocation"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"http://maven.apache.org/SETTINGS/1.0.0'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'                      http://maven.apache.org/xsd/settings-1.0.0.xsd"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"servers"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <!- To publish a snapshot of some part of Maven -->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"server"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">apache.snapshots.https</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_APACHE_ID"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_APACHE_PASSWORD"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"server"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    <!-- To publish a website using Maven -->"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    <!-- To stage a release of some part of Maven -->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"server"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">apache.releases.https</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_APACHE_ID"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"username"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_APACHE_PASSWORD"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"password"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"server"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"servers"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"profiles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"profile"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">apache-release</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"id"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"properties"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gpg.keyname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_KEYNAME</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gpg.keyname"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    <!--Keyname is something like this ... 00A5F21E... do `gpg ——list-keys` to find it-->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gpg.passphrase"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_KEY_PASSWORD"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"gpg.passphrase"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"properties"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"profile"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"profiles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"settings"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})})]}),e.jsxs(i,{children:[e.jsxs(s.h4,{id:"update-the-changesmd-and-releasenotesmd-files-and-the-pom-files",children:["Update the ",e.jsx(s.em,{children:"CHANGES.md"})," and ",e.jsx(s.em,{children:"RELEASENOTES.md"})," files and the POM files."]}),e.jsxs(s.p,{children:["Update ",e.jsx(s.em,{children:"CHANGES.md"}),` with the changes since the last release. Be careful with where you put
headings and license. Respect the instructions and warning you find in current
`,e.jsx(s.em,{children:"CHANGES.md"})," and ",e.jsx(s.em,{children:"RELEASENOTES.md"}),` since these two files are processed by tooling that is
looking for particular string sequences. See `,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-21399",children:"HBASE-21399"}),`
for description on how to make use of yetus generating additions to
`,e.jsx(s.em,{children:"CHANGES.md"})," and ",e.jsx(s.em,{children:"RELEASENOTES.md"}),` (RECOMMENDED!). Adding JIRA fixes, make sure the
URL to the JIRA points to the proper location which lists fixes for this release.`]}),e.jsxs(s.p,{children:[`Next, adjust the version in all the POM files appropriately.
If you are making a release candidate, you must remove the `,e.jsx(s.code,{children:"-SNAPSHOT"}),` label from all versions
in all pom.xml files.
If you are running this receipe to publish a snapshot, you must keep the `,e.jsx(s.code,{children:"-SNAPSHOT"}),` suffix on the hbase version.
The `,e.jsx(s.a,{href:"http://www.mojohaus.org/versions-maven-plugin/",children:"Versions Maven Plugin"}),` can be of use here.
To set a version in all the many poms of the hbase multi-module project, use a command like the following:`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.codehaus.mojo:versions-maven-plugin:2.5:set"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DnewVersion=2.1.0-SNAPSHOT"})]})})})}),e.jsxs(s.p,{children:["Make sure all versions in poms are changed! Checkin the ",e.jsx(s.em,{children:"CHANGES.md"}),", ",e.jsx(s.em,{children:"RELEASENOTES.md"}),`, and
any maven version changes.`]})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"update-the-documentation",children:"Update the documentation."}),e.jsxs(s.p,{children:["Update the documentation under ",e.jsx(s.em,{children:"hbase-website/app/page/_docs/docs/_mdx/(multi-page)"}),`.
This usually involves copying the latest from master branch and making version-particular
adjustments to suit this release candidate version. Commit your changes.`]})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"clean-the-checkout-dir",children:"Clean the checkout dir"}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -x"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -d"})]})]})})})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"run-apache-rat",children:"Run Apache-Rat"}),e.jsx(s.p,{children:"Check licenses are good"}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apache-rat:check"})]})})})}),e.jsx(s.p,{children:"If the above fails, check the rat log."}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" grep"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'Rat check'"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" patchprocess/mvn_apache_rat.log"})]})})})})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"create-a-release-tag",children:"Create a release tag."}),e.jsxs(s.p,{children:[`Presuming you have run basic tests, the rat check, passes and all is
looking good, now is the time to tag the release candidate (You
always remove the tag if you need to redo). To tag, do
what follows substituting in the version appropriate to your build.
All tags should be signed tags; i.e. pass the `,e.jsx(s.em,{children:"-s"}),` option (See
`,e.jsx(s.a,{href:"https://git-scm.com/book/id/v2/Git-Tools-Signing-Your-Work",children:"Signing Your Work"}),`
for how to set up your git environment for signing).`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tag"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2.0.0-alpha4-RC0"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -m"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Tagging the 2.0.0-alpha4 first Releae Candidate (Candidates start at zero)"'})]})})})}),e.jsxs(s.p,{children:["Or, if you are making a release, tags should have a ",e.jsx(s.em,{children:"rel/"}),` prefix to ensure
they are preserved in the Apache repo as in:`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"+$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tag"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rel/2.0.0-alpha4"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -m"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Tagging the 2.0.0-alpha4 Release"'})]})})})}),e.jsx(s.p,{children:"Push the (specific) tag (only) so others have access."}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" push"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2.0.0-alpha4-RC0"})]})})})}),e.jsxs(s.p,{children:[`For how to delete tags, see
`,e.jsx(s.a,{href:"http://www.manikrathee.com/how-to-delete-a-tag-in-git.html",children:"How to Delete a Tag"}),`. Covers
deleting tags that have not yet been pushed to the remote Apache
repo as well as delete of tags pushed to Apache.`]})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"build-the-source-tarball",children:"Build the source tarball."}),e.jsxs(s.p,{children:[`Now, build the source tarball. Lets presume we are building the source
tarball for the tag `,e.jsx(s.em,{children:"2.0.0-alpha4-RC0"})," into ",e.jsx(s.em,{children:"/tmp/hbase-2.0.0-alpha4-RC0/"}),`
(This step requires that the mvn and git clean steps described above have just been done).`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" archive"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --format=tar.gz"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"/tmp/hbase-2.0.0-alpha4-RC0/hbase-2.0.0-alpha4-src.tar.gz"'}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --prefix="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hbase-2.0.0-alpha4/"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $git_tag"})]})})})}),e.jsxs(s.p,{children:[`Above we generate the hbase-2.0.0-alpha4-src.tar.gz tarball into the
`,e.jsx(s.em,{children:"/tmp/hbase-2.0.0-alpha4-RC0"})," build output directory (We don't want the ",e.jsx(s.em,{children:"RC0"}),` in the name or prefix.
These bits are currently a release candidate but if the VOTE passes, they will become the release so we do not taint
the artifact names with `,e.jsx(s.em,{children:"RCX"}),")."]})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"build-the-binary-tarball",children:"Build the binary tarball."}),e.jsxs(s.p,{children:["Next, build the binary tarball. Add the ",e.jsx(s.code,{children:"-Prelease"}),` profile when building.
It runs the license apache-rat check among other rules that help ensure
all is wholesome. Do it in two steps.`]}),e.jsx(s.p,{children:"First install into the local repository"}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Prelease"})]})})})}),e.jsx(s.p,{children:`Next, generate documentation and assemble the tarball. Be warned,
this next step can take a good while, a couple of hours generating site
documentation.`}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" site"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" assembly:single"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Prelease"})]})})})}),e.jsx(s.p,{children:`Otherwise, the build complains that hbase modules are not in the maven repository
when you try to do it all in one step, especially on a fresh repository.
It seems that you need the install goal in both steps.`}),e.jsxs(s.p,{children:[`Extract the generated tarball — you'll find it under
`,e.jsx(s.em,{children:"hbase-assembly/target"}),` and check it out.
Look at the documentation, see if it runs, etc.
If good, copy the tarball beside the source tarball in the
build output directory.`]})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"deploy-to-the-maven-repository",children:"Deploy to the Maven Repository."}),e.jsxs(s.p,{children:[`Next, deploy HBase to the Apache Maven repository. Add the
apache-release`,e.jsx(s.code,{children:"profile when running the"}),`mvn deploy\` command.
This profile comes from the Apache parent pom referenced by our pom files.
It does signing of your artifacts published to Maven, as long as the
`,e.jsx(s.em,{children:"settings.xml"})," is configured correctly, as described in ",e.jsx(s.a,{href:"/docs/building-and-developing/releasing#example-m2settingsxml-file",children:"Example ~/.m2/settings.xml File"}),`.
This step depends on the local repository having been populate
by the just-previous bin tarball build.`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" deploy"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Papache-release"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Prelease"})]})})})}),e.jsx(s.p,{children:`This command copies all artifacts up to a temporary staging Apache mvn repository in an 'open' state.
More work needs to be done on these maven artifacts to make them generally available.`}),e.jsxs(s.p,{children:[`We do not release HBase tarball to the Apache Maven repository. To avoid deploying the tarball, do not
include the `,e.jsx(s.code,{children:"assembly:single"})," goal in your ",e.jsx(s.code,{children:"mvn deploy"})," command. Check the deployed artifacts as described in the next section."]}),e.jsx(a,{type:"info",title:"make_rc.sh",children:e.jsxs(s.p,{children:["If you ran the old ",e.jsx(s.em,{children:"dev-support/make_rc.sh"}),` script, this is as far as it takes you. To finish the
release, take up the script from here on out.`]})})]}),e.jsxs(i,{children:[e.jsx(s.h4,{id:"make-the-release-candidate-available",children:"Make the Release Candidate available."}),e.jsxs(s.p,{children:[`The artifacts are in the maven repository in the staging area in the 'open' state.
While in this 'open' state you can check out what you've published to make sure all is good.
To do this, log in to Apache's Nexus at `,e.jsx(s.a,{href:"https://repository.apache.org",children:"repository.apache.org"}),` using your Apache ID.
Find your artifacts in the staging repository. Click on 'Staging Repositories' and look for a new one ending in "hbase" with a status of 'Open', select it.
Use the tree view to expand the list of repository contents and inspect if the artifacts you expect are present. Check the POMs.
As long as the staging repo is open you can re-upload if something is missing or built incorrectly.`]}),e.jsx(s.p,{children:`If something is seriously wrong and you would like to back out the upload, you can use the 'Drop' button to drop and delete the staging repository.
Sometimes the upload fails in the middle. This is another reason you might have to 'Drop' the upload from the staging repository.`}),e.jsxs(s.p,{children:[`If it checks out, close the repo using the 'Close' button. The repository must be closed before a public URL to it becomes available. It may take a few minutes for the repository to close. Once complete you'll see a public URL to the repository in the Nexus UI. You may also receive an email with the URL. Provide the URL to the temporary staging repository in the email that announces the release candidate.
(Folks will need to add this repo URL to their local poms or to their local `,e.jsx(s.em,{children:"settings.xml"})," file to pull the published release candidate artifacts.)"]}),e.jsx(s.p,{children:"When the release vote concludes successfully, return here and click the 'Release' button to release the artifacts to central. The release process will automatically drop and delete the staging repository."}),e.jsx(a,{type:"info",title:"hbase-downstreamer",children:e.jsxs(s.p,{children:["See the ",e.jsx(s.a,{href:"https://github.com/saintstack/hbase-downstreamer",children:"hbase-downstreamer"}),` test for a simple
example of a project that is downstream of HBase an depends on it. Check it out and run its simple
test to make sure maven artifacts are properly deployed to the maven repository. Be sure to edit
the pom to point to the proper staging repository. Make sure you are pulling from the repository
when tests run and that you are not getting from your local repository, by either passing the `,e.jsx(s.code,{children:"-U"}),`
flag or deleting your local repo content and check maven is pulling from remote out of the staging
repository.`]})}),e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"https://www.apache.org/dev/publishing-maven-artifacts.html",children:"Publishing Maven Artifacts"})," for some pointers on this maven staging process."]}),e.jsxs(s.p,{children:["If the HBase version ends in ",e.jsx(s.code,{children:"-SNAPSHOT"}),`, the artifacts go elsewhere.
They are put into the Apache snapshots repository directly and are immediately available.
Making a SNAPSHOT release, this is what you want to happen.`]}),e.jsxs(s.p,{children:[`At this stage, you have two tarballs in your 'build output directory' and a set of artifacts
in a staging area of the maven repository, in the 'closed' state.
Next sign, fingerprint and then 'stage' your release candiate build output directory via svnpubsub by committing
your directory to `,e.jsx(s.a,{href:"https://dist.apache.org/repos/dist/dev/hbase/",children:"The dev distribution directory"}),`
(See comments on `,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-10554",children:"HBASE-10554 Please delete old releases from mirroring system"}),`
but in essence it is an svn checkout of `,e.jsx(s.a,{href:"https://dist.apache.org/repos/dist/dev/hbase",children:"dev/hbase"}),` — releases are at
`,e.jsx(s.a,{href:"https://dist.apache.org/repos/dist/release/hbase",children:"release/hbase"}),"). In the ",e.jsx(s.em,{children:"version directory"})," run the following commands:"]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" *"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".tar.gz"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" echo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i; "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gpg"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --print-md"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MD5"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".md5"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" *"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".tar.gz"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" echo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i; "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gpg"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --print-md"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" SHA512"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".sha"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" *"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".tar.gz"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" echo"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i; "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gpg"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --armor"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".asc"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --detach-sig"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $i  ; "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" .."})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Presuming our 'build output directory' is named 0.96.0RC0, copy it to the svn checkout of the dist dev dir"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# in this case named hbase.dist.dev.svn"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /Users/stack/checkouts/hbase.dist.dev.svn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" svn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" info"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Path:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Working"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Copy"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Root"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Path:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /Users/stack/checkouts/hbase.dist.dev.svn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"URL:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://dist.apache.org/repos/dist/dev/hbase"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Repository"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Root:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://dist.apache.org/repos/dist"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Repository"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" UUID:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0d268c88-bc11-4956-87df-91683dc98e59"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Revision:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 15087"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Node"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Kind:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" directory"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Schedule:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" normal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Last"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Changed"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Author:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ndimiduk"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Last"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Changed"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Rev:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 15045"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Last"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Changed"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Date:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2016-08-28"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:13:36"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -0700"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Sun, "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"28"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Aug"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2016"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mv"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0.96.0RC0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /Users/stack/checkouts/hbase.dist.dev.svn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" svn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0.96.0RC0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" svn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" commit"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),e.jsxs(s.p,{children:["Ensure it actually gets published by checking ",e.jsx(s.a,{href:"https://dist.apache.org/repos/dist/dev/hbase/",children:"https://dist.apache.org/repos/dist/dev/hbase/"}),"."]}),e.jsx(s.p,{children:"Announce the release candidate on the mailing list and call a vote."})]})]}),`
`,e.jsx(s.h3,{id:"publishing-a-snapshot-to-maven",children:"Publishing a SNAPSHOT to maven"}),`
`,e.jsxs(s.p,{children:["Make sure your ",e.jsx(s.em,{children:"settings.xml"})," is set up properly (see ",e.jsx(s.a,{href:"/docs/building-and-developing/releasing#example-m2settingsxml-file",children:"Example ~/.m2/settings.xml File"}),`).
Make sure the hbase version includes `,e.jsx(s.code,{children:"-SNAPSHOT"}),` as a suffix.
Following is an example of publishing SNAPSHOTS of a release that had an hbase version of 0.96.0 in its poms.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  javadoc:aggregate"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" site"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" assembly:single"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Prelease"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mvn"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  deploy"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Papache-release"})]})]})})}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.em,{children:"make_rc.sh"})," script mentioned above (see ",e.jsx(s.a,{href:"/docs/building-and-developing/releasing#making-a-release-candidate",children:"Making a Release Candidate"}),") can help you publish ",e.jsx(s.code,{children:"SNAPSHOTS"}),`.
Make sure your `,e.jsx(s.code,{children:"hbase.version"})," has a ",e.jsx(s.code,{children:"-SNAPSHOT"}),` suffix before running the script.
It will put a snapshot up into the apache snapshot repository for you.`]})]})}function k(t={}){const{wrapper:s}=t.components||{};return s?e.jsx(s,{...t,children:e.jsx(r,{...t})}):r(t)}function n(t,s){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,k as default,c as extractedReferences,d as frontmatter,p as structuredData,g as toc};
