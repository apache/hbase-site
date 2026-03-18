import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`## Basic Compile

HBase is compiled using Maven. You must use at least Maven 3.0.4. To check your Maven version, run
the command \`mvn -version\`.

### JDK Version Requirements

HBase has Java version compiler requirements that vary by release branch. At compilation time,
HBase has the same version requirements as it does for runtime. See [Java](/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java) for a complete
support matrix of Java version by HBase version.

### Maven Build Commands

All commands are executed from the local HBase project directory.

#### Package

The simplest command to compile HBase from its java source code is to use the \`package\` target, which builds JARs with the compiled files.

\`\`\`bash
mvn package -DskipTests
\`\`\`

Or, to clean up before compiling:

\`\`\`bash
mvn clean package -DskipTests
\`\`\`

With Eclipse set up as explained above in [Eclipse](/docs/building-and-developing#eclipse), you can also use the **Build** command in Eclipse.
To create the full installable HBase package takes a little bit more work, so read on.

#### Compile

The \`compile\` target does not create the JARs with the compiled files.

\`\`\`bash
mvn compile
\`\`\`

\`\`\`bash
mvn clean compile
\`\`\`

#### Install

To install the JARs in your *\\~/.m2/* directory, use the \`install\` target.

\`\`\`bash
mvn install
\`\`\`

\`\`\`bash
mvn clean install
\`\`\`

\`\`\`bash
mvn clean install -DskipTests
\`\`\`

#### Building HBase 2.x on Apple Silicon

Building a non-master branch requires protoc 2.5.0 binary which is not available for Apple Silicon.
HBASE-27741 added a workaround to the build to fall back to osx-x86\\_64 version of protoc automatically by \`apple-silicon-workaround\` Maven profile.
The intention is that this change will permit the build to proceed with the x86 version of \`protoc\`, making use of the Rosetta instruction translation service built into the OS.
If you'd like to provide and make use of your own aarch\\_64 \`protoc\`, you can disable this profile on the command line by adding \`-P'!apple-silicon-workaround'\`, or through configuration in your \`settings.xml\`.

You can use the following commands to build protoc on your Apple Silicon machine.

\`\`\`bash
curl -sSL https://github.com/protocolbuffers/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz | tar zx -
cd protobuf-2.5.0
curl -L -O https://gist.githubusercontent.com/liusheng/64aee1b27de037f8b9ccf1873b82c413/raw/118c2fce733a9a62a03281753572a45b6efb8639/protobuf-2.5.0-arm64.patch
patch -p1 < protobuf-2.5.0-arm64.patch
./configure --disable-shared
make
mvn install:install-file -DgroupId=com.google.protobuf -DartifactId=protoc -Dversion=2.5.0 -Dclassifier=osx-aarch_64 -Dpackaging=exe -Dfile=src/protoc
\`\`\`

### Running all or individual Unit Tests

See the [Running tests](/docs/building-and-developing/tests#running-tests) section in [Unit Tests](/docs/building-and-developing/tests#building-and-developing-unit-tests)

### Building against various Hadoop versions

HBase supports building against Apache Hadoop versions: 2.y and 3.y (early release artifacts).
Exactly which version of Hadoop is used by default varies by release branch. See the section
[Hadoop](/docs/configuration/basic-prerequisites#hadoop) for the complete breakdown of supported Hadoop version by HBase release.

The mechanism for selecting a Hadoop version at build time is identical across all releases. Which
version of Hadoop is default varies. We manage Hadoop major version selection by way of Maven
profiles. Due to the peculiarities of Maven profile mutual exclusion, the profile that builds
against a particular Hadoop version is activated by setting a property, *not* the usual profile
activation. Hadoop version profile activation is summarized by the following table.

#### Hadoop Profile Activation by HBase Release

|            | Hadoop2 Activation  | Hadoop3 Activation     |
| ---------- | ------------------- | ---------------------- |
| HBase 1.3+ | *active by default* | \`-Dhadoop.profile=3.0\` |
| HBase 3.0+ | *not supported*     | *active by default*    |

<Callout type="warn">
  Please note that where a profile is active by default, \`hadoop.profile\` must NOT be provided.
</Callout>

Once the Hadoop major version profile is activated, the exact Hadoop version can be
specified by overriding the appropriate property value. For Hadoop2 versions, the property name
is \`hadoop-two.version\`. With Hadoop3 versions, the property name is \`hadoop-three.version\`.

#### Example 1: Building HBase 1.7 against Hadoop 2.10.0

For example, to build HBase 1.7 against Hadoop 2.10.0, the profile is set for Hadoop2 by default,
so only \`hadoop-two.version\` must be specified:

\`\`\`bash
git checkout branch-1
mvn -Dhadoop-two.version=2.10.0 ...
\`\`\`

#### Example 2: Building HBase 2.3 or 2.4 against Hadoop 3.4.0-SNAPSHOT

This is how a developer might check the compatibility of HBase 2.3 or 2.4 against an unreleased
Hadoop version (currently 3.4). Both the Hadoop3 profile and version must be specified:

\`\`\`bash
git checkout branch-2.4
mvn -Dhadoop.profile=3.0 -Dhadoop-three.version=3.4.0-SNAPSHOT ...
\`\`\`

#### Example 3: Building HBase 3.0 against Hadoop 3.4.0-SNAPSHOT

The same developer might want also to check the development version of HBase (currently 3.0)
against the development version of Hadoop (currently 3.4). In this case, the Hadoop3 profile is
active by default, so only \`hadoop-three.version\` must be specified:

\`\`\`bash
git checkout master
mvn -Dhadoop-three.version=3.4.0-SNAPSHOT ...
\`\`\`

### Building with JDK11 and Hadoop3

HBase manages JDK-specific build settings using Maven profiles. The profile appropriate to the JDK
in use is automatically activated. Building and running on JDK8 supports both Hadoop2 and Hadoop3.
For JDK11, only Hadoop3 is supported. Thus, the Hadoop3 profile must be active when building on
JDK11, and the artifacts used when running HBase on JDK11 must be compiled against Hadoop3.
Furthermore, the JDK11 profile requires a minimum Hadoop version of 3.2.0. This value is specified
by the JDK11 profile, but it can be overridden using the \`hadoop-three.version\` property as normal.
For details on Hadoop profile activation by HBase branch, see
[Building against various Hadoop versions](/docs/building-and-developing/building#building-against-various-hadoop-versions). See [Java](/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java) for a complete
support matrix of Java version by HBase version.

#### Example 1: Building HBase 2.3 or 2.4 with JDK11

To build HBase 2.3 or 2.4 with JDK11, the Hadoop3 profile must be activated explicitly.

\`\`\`bash
git checkout branch-2.4
JAVA_HOME=/usr/lib/jvm/java-11 mvn -Dhadoop.profile=3.0 ...
\`\`\`

#### Example 2: Building HBase 3.0 with JDK11

For HBase 3.0, the Hadoop3 profile is active by default, no additional properties need be
specified.

\`\`\`bash
git checkout master
JAVA_HOME=/usr/lib/jvm/java-11 mvn ...
\`\`\`

### Building and testing in an IDE with JDK11 and Hadoop3

Continuing the discussion from the [earlier section](/docs/building-and-developing/building#building-with-jdk11-and-hadoop3), building and
testing with JDK11 and Hadoop3 within an IDE may require additional configuration. Specifically,
make sure the JVM version used by the IDE is a JDK11, the active JDK Maven profile is for JDK11,
and the Maven profile for JDK8 is NOT active. Likewise, ensure the Hadoop3 Maven profile is active
and the Hadoop2 Maven profile is NOT active.

### Build Protobuf

You may need to change the protobuf definitions that reside in the *hbase-protocol* module or other modules.

Previous to hbase-2.0.0, protobuf definition files were sprinkled across all hbase modules but now all
to do with protobuf must reside in the hbase-protocol module; we are trying to contain our protobuf
use so we can freely change versions without upsetting any downstream project use of protobuf.

The protobuf files are located in *hbase-protocol/src/main/protobuf*.
For the change to be effective, you will need to regenerate the classes.

\`\`\`bash
mvn package -pl hbase-protocol -am
\`\`\`

Similarly, protobuf definitions for internal use are located in the *hbase-protocol-shaded* module.

\`\`\`bash
mvn package -pl hbase-protocol-shaded -am
\`\`\`

Typically, protobuf code generation is done using the native \`protoc\` binary. In our build we use a maven plugin for
convenience; however, the plugin may not be able to retrieve appropriate binaries for all platforms. If you find yourself
on a platform where protoc fails, you will have to compile protoc from source, and run it independent of our maven build.
You can disable the inline code generation by specifying \`-Dprotoc.skip\` in your maven arguments, allowing your build to proceed further.

<Callout type="info">
  If you need to manually generate your protobuf files, you should not use \`clean\` in subsequent
  maven calls, as that will delete the newly generated files.
</Callout>

Read the *hbase-protocol/README.txt* for more details

### Build Thrift

You may need to change the thrift definitions that reside in the *hbase-thrift* module or other modules.

The thrift files are located in *hbase-thrift/src/main/resources*.
For the change to be effective, you will need to regenerate the classes.
You can use maven profile \`compile-thrift\` to do this.

\`\`\`bash
mvn compile -Pcompile-thrift
\`\`\`

You may also want to define \`thrift.path\` for the thrift binary, using the following command:

\`\`\`bash
mvn compile -Pcompile-thrift -Dthrift.path=/opt/local/bin/thrift
\`\`\`

### Build a Tarball

You can build a tarball without going through the release process described in [Releasing Apache HBase](/docs/building-and-developing/releasing), by running the following command:

\`\`\`bash
mvn -DskipTests clean install && mvn -DskipTests package assembly:single
\`\`\`

The distribution tarball is built in \`hbase-assembly/target/hbase-<version>-bin.tar.gz\`.

You can install or deploy the tarball by having the assembly:single goal before install or deploy in the maven command:

\`\`\`bash
mvn -DskipTests package assembly:single install
\`\`\`

\`\`\`bash
mvn -DskipTests package assembly:single deploy
\`\`\`

### Build Gotchas

#### Maven Site failure

If you see \`Unable to find resource 'VM_global_library.vm'\`, ignore it.
It's not an error.
It is [officially ugly](https://issues.apache.org/jira/browse/MSITE-286) though.

## Build On Linux Aarch64

HBase runs on both Windows and UNIX-like systems, and it should run on any platform
that runs a supported version of Java. This should include JVMs on x86\\_64 and aarch64.
The documentation below describes how to build hbase on aarch64 platform.

### Set Environment Variables

Manually install Java and Maven on aarch64 servers if they are not installed,
and set environment variables. For example:

\`\`\`bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64
export MAVEN_HOME=/opt/maven
export PATH=\${MAVEN_HOME}/bin:\${JAVA_HOME}/bin:\${PATH}
\`\`\`

### Use Protobuf Supported On Aarch64

Now HBase uses protobuf of two versions. Version '3.11.4' of protobuf that hbase uses
internally and version '2.5.0' as external usage.
Package protoc-2.5.0 does not work on aarch64 platform, we should add maven
profile '-Paarch64' when building. It downloads protoc-2.5.0 package from maven
repository which we made on aarch64 platform locally.

\`\`\`bash
mvn clean install -Paarch64 -DskipTests
\`\`\`

<Callout type="info">
  Protobuf is released with aarch64 protoc since version '3.5.0', and we are planning to upgrade
  protobuf later, then we don't have to add the profile '-Paarch64' anymore.
</Callout>
`,r={title:"Building Apache HBase",description:"Maven build commands, JDK requirements, Hadoop version selection, and building HBase from source including protobuf and thrift generation."},h=[{href:"/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java"},{href:"/docs/building-and-developing#eclipse"},{href:"/docs/building-and-developing/tests#running-tests"},{href:"/docs/building-and-developing/tests#building-and-developing-unit-tests"},{href:"/docs/configuration/basic-prerequisites#hadoop"},{href:"/docs/building-and-developing/building#building-against-various-hadoop-versions"},{href:"/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java"},{href:"/docs/building-and-developing/building#building-with-jdk11-and-hadoop3"},{href:"/docs/building-and-developing/releasing"},{href:"https://issues.apache.org/jira/browse/MSITE-286"}],d={contents:[{heading:"basic-compile",content:`HBase is compiled using Maven. You must use at least Maven 3.0.4. To check your Maven version, run
the command mvn -version.`},{heading:"building-basic-compile-jdk-version-requirements",content:`HBase has Java version compiler requirements that vary by release branch. At compilation time,
HBase has the same version requirements as it does for runtime. See Java for a complete
support matrix of Java version by HBase version.`},{heading:"maven-build-commands",content:"All commands are executed from the local HBase project directory."},{heading:"package",content:"The simplest command to compile HBase from its java source code is to use the package target, which builds JARs with the compiled files."},{heading:"package",content:"Or, to clean up before compiling:"},{heading:"package",content:`With Eclipse set up as explained above in Eclipse, you can also use the Build command in Eclipse.
To create the full installable HBase package takes a little bit more work, so read on.`},{heading:"compile",content:"The compile target does not create the JARs with the compiled files."},{heading:"install",content:"To install the JARs in your ~/.m2/ directory, use the install target."},{heading:"building-hbase-2x-on-apple-silicon",content:`Building a non-master branch requires protoc 2.5.0 binary which is not available for Apple Silicon.
HBASE-27741 added a workaround to the build to fall back to osx-x86_64 version of protoc automatically by apple-silicon-workaround Maven profile.
The intention is that this change will permit the build to proceed with the x86 version of protoc, making use of the Rosetta instruction translation service built into the OS.
If you'd like to provide and make use of your own aarch_64 protoc, you can disable this profile on the command line by adding -P'!apple-silicon-workaround', or through configuration in your settings.xml.`},{heading:"building-hbase-2x-on-apple-silicon",content:"You can use the following commands to build protoc on your Apple Silicon machine."},{heading:"running-all-or-individual-unit-tests",content:"See the Running tests section in Unit Tests"},{heading:"building-against-various-hadoop-versions",content:`HBase supports building against Apache Hadoop versions: 2.y and 3.y (early release artifacts).
Exactly which version of Hadoop is used by default varies by release branch. See the section
Hadoop for the complete breakdown of supported Hadoop version by HBase release.`},{heading:"building-against-various-hadoop-versions",content:`The mechanism for selecting a Hadoop version at build time is identical across all releases. Which
version of Hadoop is default varies. We manage Hadoop major version selection by way of Maven
profiles. Due to the peculiarities of Maven profile mutual exclusion, the profile that builds
against a particular Hadoop version is activated by setting a property, not the usual profile
activation. Hadoop version profile activation is summarized by the following table.`},{heading:"hadoop-profile-activation-by-hbase-release",content:"Hadoop2 Activation"},{heading:"hadoop-profile-activation-by-hbase-release",content:"Hadoop3 Activation"},{heading:"hadoop-profile-activation-by-hbase-release",content:"HBase 1.3+"},{heading:"hadoop-profile-activation-by-hbase-release",content:"active by default"},{heading:"hadoop-profile-activation-by-hbase-release",content:"-Dhadoop.profile=3.0"},{heading:"hadoop-profile-activation-by-hbase-release",content:"HBase 3.0+"},{heading:"hadoop-profile-activation-by-hbase-release",content:"not supported"},{heading:"hadoop-profile-activation-by-hbase-release",content:"active by default"},{heading:"hadoop-profile-activation-by-hbase-release",content:"type: warn"},{heading:"hadoop-profile-activation-by-hbase-release",content:"Please note that where a profile is active by default, hadoop.profile must NOT be provided."},{heading:"hadoop-profile-activation-by-hbase-release",content:`Once the Hadoop major version profile is activated, the exact Hadoop version can be
specified by overriding the appropriate property value. For Hadoop2 versions, the property name
is hadoop-two.version. With Hadoop3 versions, the property name is hadoop-three.version.`},{heading:"example-1-building-hbase-17-against-hadoop-2100",content:`For example, to build HBase 1.7 against Hadoop 2.10.0, the profile is set for Hadoop2 by default,
so only hadoop-two.version must be specified:`},{heading:"example-2-building-hbase-23-or-24-against-hadoop-340-snapshot",content:`This is how a developer might check the compatibility of HBase 2.3 or 2.4 against an unreleased
Hadoop version (currently 3.4). Both the Hadoop3 profile and version must be specified:`},{heading:"example-3-building-hbase-30-against-hadoop-340-snapshot",content:`The same developer might want also to check the development version of HBase (currently 3.0)
against the development version of Hadoop (currently 3.4). In this case, the Hadoop3 profile is
active by default, so only hadoop-three.version must be specified:`},{heading:"building-with-jdk11-and-hadoop3",content:`HBase manages JDK-specific build settings using Maven profiles. The profile appropriate to the JDK
in use is automatically activated. Building and running on JDK8 supports both Hadoop2 and Hadoop3.
For JDK11, only Hadoop3 is supported. Thus, the Hadoop3 profile must be active when building on
JDK11, and the artifacts used when running HBase on JDK11 must be compiled against Hadoop3.
Furthermore, the JDK11 profile requires a minimum Hadoop version of 3.2.0. This value is specified
by the JDK11 profile, but it can be overridden using the hadoop-three.version property as normal.
For details on Hadoop profile activation by HBase branch, see
Building against various Hadoop versions. See Java for a complete
support matrix of Java version by HBase version.`},{heading:"example-1-building-hbase-23-or-24-with-jdk11",content:"To build HBase 2.3 or 2.4 with JDK11, the Hadoop3 profile must be activated explicitly."},{heading:"example-2-building-hbase-30-with-jdk11",content:`For HBase 3.0, the Hadoop3 profile is active by default, no additional properties need be
specified.`},{heading:"building-and-testing-in-an-ide-with-jdk11-and-hadoop3",content:`Continuing the discussion from the earlier section, building and
testing with JDK11 and Hadoop3 within an IDE may require additional configuration. Specifically,
make sure the JVM version used by the IDE is a JDK11, the active JDK Maven profile is for JDK11,
and the Maven profile for JDK8 is NOT active. Likewise, ensure the Hadoop3 Maven profile is active
and the Hadoop2 Maven profile is NOT active.`},{heading:"build-protobuf",content:"You may need to change the protobuf definitions that reside in the hbase-protocol module or other modules."},{heading:"build-protobuf",content:`Previous to hbase-2.0.0, protobuf definition files were sprinkled across all hbase modules but now all
to do with protobuf must reside in the hbase-protocol module; we are trying to contain our protobuf
use so we can freely change versions without upsetting any downstream project use of protobuf.`},{heading:"build-protobuf",content:`The protobuf files are located in hbase-protocol/src/main/protobuf.
For the change to be effective, you will need to regenerate the classes.`},{heading:"build-protobuf",content:"Similarly, protobuf definitions for internal use are located in the hbase-protocol-shaded module."},{heading:"build-protobuf",content:`Typically, protobuf code generation is done using the native protoc binary. In our build we use a maven plugin for
convenience; however, the plugin may not be able to retrieve appropriate binaries for all platforms. If you find yourself
on a platform where protoc fails, you will have to compile protoc from source, and run it independent of our maven build.
You can disable the inline code generation by specifying -Dprotoc.skip in your maven arguments, allowing your build to proceed further.`},{heading:"build-protobuf",content:"type: info"},{heading:"build-protobuf",content:`If you need to manually generate your protobuf files, you should not use clean in subsequent
maven calls, as that will delete the newly generated files.`},{heading:"build-protobuf",content:"Read the hbase-protocol/README.txt for more details"},{heading:"build-thrift",content:"You may need to change the thrift definitions that reside in the hbase-thrift module or other modules."},{heading:"build-thrift",content:`The thrift files are located in hbase-thrift/src/main/resources.
For the change to be effective, you will need to regenerate the classes.
You can use maven profile compile-thrift to do this.`},{heading:"build-thrift",content:"You may also want to define thrift.path for the thrift binary, using the following command:"},{heading:"build-a-tarball",content:"You can build a tarball without going through the release process described in Releasing Apache HBase, by running the following command:"},{heading:"build-a-tarball",content:"The distribution tarball is built in hbase-assembly/target/hbase-<version>-bin.tar.gz."},{heading:"build-a-tarball",content:"You can install or deploy the tarball by having the assembly:single goal before install or deploy in the maven command:"},{heading:"maven-site-failure",content:`If you see Unable to find resource 'VM_global_library.vm', ignore it.
It's not an error.
It is officially ugly though.`},{heading:"build-on-linux-aarch64",content:`HBase runs on both Windows and UNIX-like systems, and it should run on any platform
that runs a supported version of Java. This should include JVMs on x86_64 and aarch64.
The documentation below describes how to build hbase on aarch64 platform.`},{heading:"set-environment-variables",content:`Manually install Java and Maven on aarch64 servers if they are not installed,
and set environment variables. For example:`},{heading:"use-protobuf-supported-on-aarch64",content:`Now HBase uses protobuf of two versions. Version '3.11.4' of protobuf that hbase uses
internally and version '2.5.0' as external usage.
Package protoc-2.5.0 does not work on aarch64 platform, we should add maven
profile '-Paarch64' when building. It downloads protoc-2.5.0 package from maven
repository which we made on aarch64 platform locally.`},{heading:"use-protobuf-supported-on-aarch64",content:"type: info"},{heading:"use-protobuf-supported-on-aarch64",content:`Protobuf is released with aarch64 protoc since version '3.5.0', and we are planning to upgrade
protobuf later, then we don't have to add the profile '-Paarch64' anymore.`}],headings:[{id:"basic-compile",content:"Basic Compile"},{id:"building-basic-compile-jdk-version-requirements",content:"JDK Version Requirements"},{id:"maven-build-commands",content:"Maven Build Commands"},{id:"package",content:"Package"},{id:"compile",content:"Compile"},{id:"install",content:"Install"},{id:"building-hbase-2x-on-apple-silicon",content:"Building HBase 2.x on Apple Silicon"},{id:"running-all-or-individual-unit-tests",content:"Running all or individual Unit Tests"},{id:"building-against-various-hadoop-versions",content:"Building against various Hadoop versions"},{id:"hadoop-profile-activation-by-hbase-release",content:"Hadoop Profile Activation by HBase Release"},{id:"example-1-building-hbase-17-against-hadoop-2100",content:"Example 1: Building HBase 1.7 against Hadoop 2.10.0"},{id:"example-2-building-hbase-23-or-24-against-hadoop-340-snapshot",content:"Example 2: Building HBase 2.3 or 2.4 against Hadoop 3.4.0-SNAPSHOT"},{id:"example-3-building-hbase-30-against-hadoop-340-snapshot",content:"Example 3: Building HBase 3.0 against Hadoop 3.4.0-SNAPSHOT"},{id:"building-with-jdk11-and-hadoop3",content:"Building with JDK11 and Hadoop3"},{id:"example-1-building-hbase-23-or-24-with-jdk11",content:"Example 1: Building HBase 2.3 or 2.4 with JDK11"},{id:"example-2-building-hbase-30-with-jdk11",content:"Example 2: Building HBase 3.0 with JDK11"},{id:"building-and-testing-in-an-ide-with-jdk11-and-hadoop3",content:"Building and testing in an IDE with JDK11 and Hadoop3"},{id:"build-protobuf",content:"Build Protobuf"},{id:"build-thrift",content:"Build Thrift"},{id:"build-a-tarball",content:"Build a Tarball"},{id:"build-gotchas",content:"Build Gotchas"},{id:"maven-site-failure",content:"Maven Site failure"},{id:"build-on-linux-aarch64",content:"Build On Linux Aarch64"},{id:"set-environment-variables",content:"Set Environment Variables"},{id:"use-protobuf-supported-on-aarch64",content:"Use Protobuf Supported On Aarch64"}]};const c=[{depth:2,url:"#basic-compile",title:e.jsx(e.Fragment,{children:"Basic Compile"})},{depth:3,url:"#building-basic-compile-jdk-version-requirements",title:e.jsx(e.Fragment,{children:"JDK Version Requirements"})},{depth:3,url:"#maven-build-commands",title:e.jsx(e.Fragment,{children:"Maven Build Commands"})},{depth:4,url:"#package",title:e.jsx(e.Fragment,{children:"Package"})},{depth:4,url:"#compile",title:e.jsx(e.Fragment,{children:"Compile"})},{depth:4,url:"#install",title:e.jsx(e.Fragment,{children:"Install"})},{depth:4,url:"#building-hbase-2x-on-apple-silicon",title:e.jsx(e.Fragment,{children:"Building HBase 2.x on Apple Silicon"})},{depth:3,url:"#running-all-or-individual-unit-tests",title:e.jsx(e.Fragment,{children:"Running all or individual Unit Tests"})},{depth:3,url:"#building-against-various-hadoop-versions",title:e.jsx(e.Fragment,{children:"Building against various Hadoop versions"})},{depth:4,url:"#hadoop-profile-activation-by-hbase-release",title:e.jsx(e.Fragment,{children:"Hadoop Profile Activation by HBase Release"})},{depth:4,url:"#example-1-building-hbase-17-against-hadoop-2100",title:e.jsx(e.Fragment,{children:"Example 1: Building HBase 1.7 against Hadoop 2.10.0"})},{depth:4,url:"#example-2-building-hbase-23-or-24-against-hadoop-340-snapshot",title:e.jsx(e.Fragment,{children:"Example 2: Building HBase 2.3 or 2.4 against Hadoop 3.4.0-SNAPSHOT"})},{depth:4,url:"#example-3-building-hbase-30-against-hadoop-340-snapshot",title:e.jsx(e.Fragment,{children:"Example 3: Building HBase 3.0 against Hadoop 3.4.0-SNAPSHOT"})},{depth:3,url:"#building-with-jdk11-and-hadoop3",title:e.jsx(e.Fragment,{children:"Building with JDK11 and Hadoop3"})},{depth:4,url:"#example-1-building-hbase-23-or-24-with-jdk11",title:e.jsx(e.Fragment,{children:"Example 1: Building HBase 2.3 or 2.4 with JDK11"})},{depth:4,url:"#example-2-building-hbase-30-with-jdk11",title:e.jsx(e.Fragment,{children:"Example 2: Building HBase 3.0 with JDK11"})},{depth:3,url:"#building-and-testing-in-an-ide-with-jdk11-and-hadoop3",title:e.jsx(e.Fragment,{children:"Building and testing in an IDE with JDK11 and Hadoop3"})},{depth:3,url:"#build-protobuf",title:e.jsx(e.Fragment,{children:"Build Protobuf"})},{depth:3,url:"#build-thrift",title:e.jsx(e.Fragment,{children:"Build Thrift"})},{depth:3,url:"#build-a-tarball",title:e.jsx(e.Fragment,{children:"Build a Tarball"})},{depth:3,url:"#build-gotchas",title:e.jsx(e.Fragment,{children:"Build Gotchas"})},{depth:4,url:"#maven-site-failure",title:e.jsx(e.Fragment,{children:"Maven Site failure"})},{depth:2,url:"#build-on-linux-aarch64",title:e.jsx(e.Fragment,{children:"Build On Linux Aarch64"})},{depth:3,url:"#set-environment-variables",title:e.jsx(e.Fragment,{children:"Set Environment Variables"})},{depth:3,url:"#use-protobuf-supported-on-aarch64",title:e.jsx(e.Fragment,{children:"Use Protobuf Supported On Aarch64"})}];function a(n){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...n.components},{Callout:s}=i;return s||t("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"basic-compile",children:"Basic Compile"}),`
`,e.jsxs(i.p,{children:[`HBase is compiled using Maven. You must use at least Maven 3.0.4. To check your Maven version, run
the command `,e.jsx(i.code,{children:"mvn -version"}),"."]}),`
`,e.jsx(i.h3,{id:"building-basic-compile-jdk-version-requirements",children:"JDK Version Requirements"}),`
`,e.jsxs(i.p,{children:[`HBase has Java version compiler requirements that vary by release branch. At compilation time,
HBase has the same version requirements as it does for runtime. See `,e.jsx(i.a,{href:"/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java",children:"Java"}),` for a complete
support matrix of Java version by HBase version.`]}),`
`,e.jsx(i.h3,{id:"maven-build-commands",children:"Maven Build Commands"}),`
`,e.jsx(i.p,{children:"All commands are executed from the local HBase project directory."}),`
`,e.jsx(i.h4,{id:"package",children:"Package"}),`
`,e.jsxs(i.p,{children:["The simplest command to compile HBase from its java source code is to use the ",e.jsx(i.code,{children:"package"})," target, which builds JARs with the compiled files."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsx(i.p,{children:"Or, to clean up before compiling:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsxs(i.p,{children:["With Eclipse set up as explained above in ",e.jsx(i.a,{href:"/docs/building-and-developing#eclipse",children:"Eclipse"}),", you can also use the ",e.jsx(i.strong,{children:"Build"}),` command in Eclipse.
To create the full installable HBase package takes a little bit more work, so read on.`]}),`
`,e.jsx(i.h4,{id:"compile",children:"Compile"}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"compile"})," target does not create the JARs with the compiled files."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compile"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compile"})]})})})}),`
`,e.jsx(i.h4,{id:"install",children:"Install"}),`
`,e.jsxs(i.p,{children:["To install the JARs in your ",e.jsx(i.em,{children:"~/.m2/"})," directory, use the ",e.jsx(i.code,{children:"install"})," target."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsx(i.h4,{id:"building-hbase-2x-on-apple-silicon",children:"Building HBase 2.x on Apple Silicon"}),`
`,e.jsxs(i.p,{children:[`Building a non-master branch requires protoc 2.5.0 binary which is not available for Apple Silicon.
HBASE-27741 added a workaround to the build to fall back to osx-x86_64 version of protoc automatically by `,e.jsx(i.code,{children:"apple-silicon-workaround"}),` Maven profile.
The intention is that this change will permit the build to proceed with the x86 version of `,e.jsx(i.code,{children:"protoc"}),`, making use of the Rosetta instruction translation service built into the OS.
If you'd like to provide and make use of your own aarch_64 `,e.jsx(i.code,{children:"protoc"}),", you can disable this profile on the command line by adding ",e.jsx(i.code,{children:"-P'!apple-silicon-workaround'"}),", or through configuration in your ",e.jsx(i.code,{children:"settings.xml"}),"."]}),`
`,e.jsx(i.p,{children:"You can use the following commands to build protoc on your Apple Silicon machine."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -sSL"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://github.com/protocolbuffers/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" zx"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" protobuf-2.5.0"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"curl"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -L"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -O"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://gist.githubusercontent.com/liusheng/64aee1b27de037f8b9ccf1873b82c413/raw/118c2fce733a9a62a03281753572a45b6efb8639/protobuf-2.5.0-arm64.patch"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"patch"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -p1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" protobuf-2.5.0-arm64.patch"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./configure"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --disable-shared"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"make"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install:install-file"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DgroupId=com.google.protobuf"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DartifactId=protoc"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dversion=2.5.0"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dclassifier=osx-aarch_64"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dpackaging=exe"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dfile=src/protoc"})]})]})})}),`
`,e.jsx(i.h3,{id:"running-all-or-individual-unit-tests",children:"Running all or individual Unit Tests"}),`
`,e.jsxs(i.p,{children:["See the ",e.jsx(i.a,{href:"/docs/building-and-developing/tests#running-tests",children:"Running tests"})," section in ",e.jsx(i.a,{href:"/docs/building-and-developing/tests#building-and-developing-unit-tests",children:"Unit Tests"})]}),`
`,e.jsx(i.h3,{id:"building-against-various-hadoop-versions",children:"Building against various Hadoop versions"}),`
`,e.jsxs(i.p,{children:[`HBase supports building against Apache Hadoop versions: 2.y and 3.y (early release artifacts).
Exactly which version of Hadoop is used by default varies by release branch. See the section
`,e.jsx(i.a,{href:"/docs/configuration/basic-prerequisites#hadoop",children:"Hadoop"})," for the complete breakdown of supported Hadoop version by HBase release."]}),`
`,e.jsxs(i.p,{children:[`The mechanism for selecting a Hadoop version at build time is identical across all releases. Which
version of Hadoop is default varies. We manage Hadoop major version selection by way of Maven
profiles. Due to the peculiarities of Maven profile mutual exclusion, the profile that builds
against a particular Hadoop version is activated by setting a property, `,e.jsx(i.em,{children:"not"}),` the usual profile
activation. Hadoop version profile activation is summarized by the following table.`]}),`
`,e.jsx(i.h4,{id:"hadoop-profile-activation-by-hbase-release",children:"Hadoop Profile Activation by HBase Release"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{}),e.jsx(i.th,{children:"Hadoop2 Activation"}),e.jsx(i.th,{children:"Hadoop3 Activation"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"HBase 1.3+"}),e.jsx(i.td,{children:e.jsx(i.em,{children:"active by default"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"-Dhadoop.profile=3.0"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"HBase 3.0+"}),e.jsx(i.td,{children:e.jsx(i.em,{children:"not supported"})}),e.jsx(i.td,{children:e.jsx(i.em,{children:"active by default"})})]})]})]}),`
`,e.jsx(s,{type:"warn",children:e.jsxs(i.p,{children:["Please note that where a profile is active by default, ",e.jsx(i.code,{children:"hadoop.profile"})," must NOT be provided."]})}),`
`,e.jsxs(i.p,{children:[`Once the Hadoop major version profile is activated, the exact Hadoop version can be
specified by overriding the appropriate property value. For Hadoop2 versions, the property name
is `,e.jsx(i.code,{children:"hadoop-two.version"}),". With Hadoop3 versions, the property name is ",e.jsx(i.code,{children:"hadoop-three.version"}),"."]}),`
`,e.jsx(i.h4,{id:"example-1-building-hbase-17-against-hadoop-2100",children:"Example 1: Building HBase 1.7 against Hadoop 2.10.0"}),`
`,e.jsxs(i.p,{children:[`For example, to build HBase 1.7 against Hadoop 2.10.0, the profile is set for Hadoop2 by default,
so only `,e.jsx(i.code,{children:"hadoop-two.version"})," must be specified:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop-two.version=2.10.0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),`
`,e.jsx(i.h4,{id:"example-2-building-hbase-23-or-24-against-hadoop-340-snapshot",children:"Example 2: Building HBase 2.3 or 2.4 against Hadoop 3.4.0-SNAPSHOT"}),`
`,e.jsx(i.p,{children:`This is how a developer might check the compatibility of HBase 2.3 or 2.4 against an unreleased
Hadoop version (currently 3.4). Both the Hadoop3 profile and version must be specified:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-2.4"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop.profile=3.0"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop-three.version=3.4.0-SNAPSHOT"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),`
`,e.jsx(i.h4,{id:"example-3-building-hbase-30-against-hadoop-340-snapshot",children:"Example 3: Building HBase 3.0 against Hadoop 3.4.0-SNAPSHOT"}),`
`,e.jsxs(i.p,{children:[`The same developer might want also to check the development version of HBase (currently 3.0)
against the development version of Hadoop (currently 3.4). In this case, the Hadoop3 profile is
active by default, so only `,e.jsx(i.code,{children:"hadoop-three.version"})," must be specified:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop-three.version=3.4.0-SNAPSHOT"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),`
`,e.jsx(i.h3,{id:"building-with-jdk11-and-hadoop3",children:"Building with JDK11 and Hadoop3"}),`
`,e.jsxs(i.p,{children:[`HBase manages JDK-specific build settings using Maven profiles. The profile appropriate to the JDK
in use is automatically activated. Building and running on JDK8 supports both Hadoop2 and Hadoop3.
For JDK11, only Hadoop3 is supported. Thus, the Hadoop3 profile must be active when building on
JDK11, and the artifacts used when running HBase on JDK11 must be compiled against Hadoop3.
Furthermore, the JDK11 profile requires a minimum Hadoop version of 3.2.0. This value is specified
by the JDK11 profile, but it can be overridden using the `,e.jsx(i.code,{children:"hadoop-three.version"}),` property as normal.
For details on Hadoop profile activation by HBase branch, see
`,e.jsx(i.a,{href:"/docs/building-and-developing/building#building-against-various-hadoop-versions",children:"Building against various Hadoop versions"}),". See ",e.jsx(i.a,{href:"/docs/configuration/basic-prerequisites#configuration-basic-prerequisites-java",children:"Java"}),` for a complete
support matrix of Java version by HBase version.`]}),`
`,e.jsx(i.h4,{id:"example-1-building-hbase-23-or-24-with-jdk11",children:"Example 1: Building HBase 2.3 or 2.4 with JDK11"}),`
`,e.jsx(i.p,{children:"To build HBase 2.3 or 2.4 with JDK11, the Hadoop3 profile must be activated explicitly."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" branch-2.4"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"JAVA_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/usr/lib/jvm/java-11"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop.profile=3.0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),`
`,e.jsx(i.h4,{id:"example-2-building-hbase-30-with-jdk11",children:"Example 2: Building HBase 3.0 with JDK11"}),`
`,e.jsx(i.p,{children:`For HBase 3.0, the Hadoop3 profile is active by default, no additional properties need be
specified.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" master"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"JAVA_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/usr/lib/jvm/java-11"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})]})})}),`
`,e.jsx(i.h3,{id:"building-and-testing-in-an-ide-with-jdk11-and-hadoop3",children:"Building and testing in an IDE with JDK11 and Hadoop3"}),`
`,e.jsxs(i.p,{children:["Continuing the discussion from the ",e.jsx(i.a,{href:"/docs/building-and-developing/building#building-with-jdk11-and-hadoop3",children:"earlier section"}),`, building and
testing with JDK11 and Hadoop3 within an IDE may require additional configuration. Specifically,
make sure the JVM version used by the IDE is a JDK11, the active JDK Maven profile is for JDK11,
and the Maven profile for JDK8 is NOT active. Likewise, ensure the Hadoop3 Maven profile is active
and the Hadoop2 Maven profile is NOT active.`]}),`
`,e.jsx(i.h3,{id:"build-protobuf",children:"Build Protobuf"}),`
`,e.jsxs(i.p,{children:["You may need to change the protobuf definitions that reside in the ",e.jsx(i.em,{children:"hbase-protocol"})," module or other modules."]}),`
`,e.jsx(i.p,{children:`Previous to hbase-2.0.0, protobuf definition files were sprinkled across all hbase modules but now all
to do with protobuf must reside in the hbase-protocol module; we are trying to contain our protobuf
use so we can freely change versions without upsetting any downstream project use of protobuf.`}),`
`,e.jsxs(i.p,{children:["The protobuf files are located in ",e.jsx(i.em,{children:"hbase-protocol/src/main/protobuf"}),`.
For the change to be effective, you will need to regenerate the classes.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -pl"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase-protocol"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -am"})]})})})}),`
`,e.jsxs(i.p,{children:["Similarly, protobuf definitions for internal use are located in the ",e.jsx(i.em,{children:"hbase-protocol-shaded"})," module."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -pl"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase-protocol-shaded"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -am"})]})})})}),`
`,e.jsxs(i.p,{children:["Typically, protobuf code generation is done using the native ",e.jsx(i.code,{children:"protoc"}),` binary. In our build we use a maven plugin for
convenience; however, the plugin may not be able to retrieve appropriate binaries for all platforms. If you find yourself
on a platform where protoc fails, you will have to compile protoc from source, and run it independent of our maven build.
You can disable the inline code generation by specifying `,e.jsx(i.code,{children:"-Dprotoc.skip"})," in your maven arguments, allowing your build to proceed further."]}),`
`,e.jsx(s,{type:"info",children:e.jsxs(i.p,{children:["If you need to manually generate your protobuf files, you should not use ",e.jsx(i.code,{children:"clean"}),` in subsequent
maven calls, as that will delete the newly generated files.`]})}),`
`,e.jsxs(i.p,{children:["Read the ",e.jsx(i.em,{children:"hbase-protocol/README.txt"})," for more details"]}),`
`,e.jsx(i.h3,{id:"build-thrift",children:"Build Thrift"}),`
`,e.jsxs(i.p,{children:["You may need to change the thrift definitions that reside in the ",e.jsx(i.em,{children:"hbase-thrift"})," module or other modules."]}),`
`,e.jsxs(i.p,{children:["The thrift files are located in ",e.jsx(i.em,{children:"hbase-thrift/src/main/resources"}),`.
For the change to be effective, you will need to regenerate the classes.
You can use maven profile `,e.jsx(i.code,{children:"compile-thrift"})," to do this."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compile"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Pcompile-thrift"})]})})})}),`
`,e.jsxs(i.p,{children:["You may also want to define ",e.jsx(i.code,{children:"thrift.path"})," for the thrift binary, using the following command:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compile"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Pcompile-thrift"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dthrift.path=/opt/local/bin/thrift"})]})})})}),`
`,e.jsx(i.h3,{id:"build-a-tarball",children:"Build a Tarball"}),`
`,e.jsxs(i.p,{children:["You can build a tarball without going through the release process described in ",e.jsx(i.a,{href:"/docs/building-and-developing/releasing",children:"Releasing Apache HBase"}),", by running the following command:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" && "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" assembly:single"})]})})})}),`
`,e.jsxs(i.p,{children:["The distribution tarball is built in ",e.jsx(i.code,{children:"hbase-assembly/target/hbase-<version>-bin.tar.gz"}),"."]}),`
`,e.jsx(i.p,{children:"You can install or deploy the tarball by having the assembly:single goal before install or deploy in the maven command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" assembly:single"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]})})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" assembly:single"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" deploy"})]})})})}),`
`,e.jsx(i.h3,{id:"build-gotchas",children:"Build Gotchas"}),`
`,e.jsx(i.h4,{id:"maven-site-failure",children:"Maven Site failure"}),`
`,e.jsxs(i.p,{children:["If you see ",e.jsx(i.code,{children:"Unable to find resource 'VM_global_library.vm'"}),`, ignore it.
It's not an error.
It is `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/MSITE-286",children:"officially ugly"})," though."]}),`
`,e.jsx(i.h2,{id:"build-on-linux-aarch64",children:"Build On Linux Aarch64"}),`
`,e.jsx(i.p,{children:`HBase runs on both Windows and UNIX-like systems, and it should run on any platform
that runs a supported version of Java. This should include JVMs on x86_64 and aarch64.
The documentation below describes how to build hbase on aarch64 platform.`}),`
`,e.jsx(i.h3,{id:"set-environment-variables",children:"Set Environment Variables"}),`
`,e.jsx(i.p,{children:`Manually install Java and Maven on aarch64 servers if they are not installed,
and set environment variables. For example:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" JAVA_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/usr/lib/jvm/java-8-openjdk-arm64"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" MAVEN_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/opt/maven"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PATH"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${PATH}"})]})]})})}),`
`,e.jsx(i.h3,{id:"use-protobuf-supported-on-aarch64",children:"Use Protobuf Supported On Aarch64"}),`
`,e.jsx(i.p,{children:`Now HBase uses protobuf of two versions. Version '3.11.4' of protobuf that hbase uses
internally and version '2.5.0' as external usage.
Package protoc-2.5.0 does not work on aarch64 platform, we should add maven
profile '-Paarch64' when building. It downloads protoc-2.5.0 package from maven
repository which we made on aarch64 platform locally.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Paarch64"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsx(s,{type:"info",children:e.jsx(i.p,{children:`Protobuf is released with aarch64 protoc since version '3.5.0', and we are planning to upgrade
protobuf later, then we don't have to add the profile '-Paarch64' anymore.`})})]})}function p(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(a,{...n})}):a(n)}function t(n,i){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,p as default,h as extractedReferences,r as frontmatter,d as structuredData,c as toc};
