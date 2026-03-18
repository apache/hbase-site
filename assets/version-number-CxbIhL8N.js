import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`## Aspirational Semantic Versioning

Starting with the 1.0.0 release, HBase is working towards [Semantic Versioning](http://semver.org/) for its release versioning. In summary:

#### Given a version number MAJOR.MINOR.PATCH, increment the: \\[!toc]

* MAJOR version when you make incompatible API changes,
* MINOR version when you add functionality in a backwards-compatible manner, and
* PATCH version when you make backwards-compatible bug fixes.
* Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

#### Compatibility Dimensions \\[!toc]

In addition to the usual API versioning considerations HBase has other compatibility dimensions that we need to consider.

#### Client-Server wire protocol compatibility \\[!toc]

* Allows updating client and server out of sync.
* We could only allow upgrading the server first. I.e. the server would be backward compatible to an old client, that way new APIs are OK.
* Example: A user should be able to use an old client to connect to an upgraded cluster.

#### Server-Server protocol compatibility \\[!toc]

* Servers of different versions can co-exist in the same cluster.
* The wire protocol between servers is compatible.
* Workers for distributed tasks, such as replication and log splitting, can co-exist in the same cluster.
* Dependent protocols (such as using ZK for coordination) will also not be changed.
* Example: A user can perform a rolling upgrade.

#### File format compatibility \\[!toc]

* Support file formats backward and forward compatible
* Example: File, ZK encoding, directory layout is upgraded automatically as part of an HBase upgrade. User can downgrade to the older version and everything will continue to work.

#### Client API compatibility \\[!toc]

* Allow changing or removing existing client APIs.
* An API needs to be deprecated for a whole major version before we will change/remove it.
  * An example: An API was deprecated in 2.0.1 and will be marked for deletion in 4.0.0. On the other hand, an API deprecated in 2.0.0 can be removed in 3.0.0.
  * Occasionally mistakes are made and internal classes are marked with a higher access level than they should. In these rare circumstances, we will accelerate the deprecation schedule to the next major version (i.e., deprecated in 2.2.x, marked \`IA.Private\` 3.0.0). Such changes are communicated and explained via release note in Jira.
* APIs available in a patch version will be available in all later patch versions. However, new APIs may be added which will not be available in earlier patch versions.
* New APIs introduced in a patch version will only be added in a source compatible way: i.e. code that implements public APIs will continue to compile. [^1]
  * Example: A user using a newly deprecated API does not need to modify application code with HBase API calls until the next major version. \\*

#### Client Binary compatibility \\[!toc]

* Client code written to APIs available in a given patch release can run unchanged (no recompilation needed) against the new jars of later patch versions.
* Client code written to APIs available in a given patch release might not run against the old jars from an earlier patch version.
  * Example: Old compiled client code will work unchanged with the new jars.
* If a Client implements an HBase Interface, a recompile MAY be required upgrading to a newer minor version (See release notes for warning about incompatible changes). All effort will be made to provide a default implementation so this case should not arise.

#### Server-Side Limited API compatibility (taken from Hadoop) \\[!toc]

* Internal APIs are marked as Stable, Evolving, or Unstable
* This implies binary compatibility for coprocessors and plugins (pluggable classes, including replication) as long as these are only using marked interfaces/classes.
* Example: Old compiled Coprocessor, Filter, or Plugin code will work unchanged with the new jars.

#### Dependency Compatibility \\[!toc]

* An upgrade of HBase will not require an incompatible upgrade of a dependent project, except for Apache Hadoop.
* An upgrade of HBase will not require an incompatible upgrade of the Java runtime.
* Example: Upgrading HBase to a version that supports *Dependency Compatibility* won't require that you upgrade your Apache ZooKeeper service.
* Example: If your current version of HBase supported running on JDK 8, then an upgrade to a version that supports *Dependency Compatibility* will also run on JDK 8.

<Callout type="tip">
  Previously, we tried to maintain dependency compatibility for the underly Hadoop service but over
  the last few years this has proven untenable. While the HBase project attempts to maintain support
  for older versions of Hadoop, we drop the "supported" designator for minor versions that fail to
  continue to see releases. Additionally, the Hadoop project has its own set of compatibility
  guidelines, which means in some cases having to update to a newer supported minor release might
  break some of our compatibility promises.
</Callout>

#### Operational Compatibility \\[!toc]

* Metric changes
* Behavioral changes of services
* JMX APIs exposed via the \`/jmx/\` endpoint

#### Summary \\[!toc]

* A patch upgrade is a drop-in replacement. Any change that is not Java binary and source compatible would not be allowed.[^2] Downgrading versions within patch releases may not be compatible.
* A minor upgrade requires no application/client code modification. Ideally it would be a drop-in replacement but client code, coprocessors, filters, etc might have to be recompiled if new jars are used.
* A major upgrade allows the HBase community to make breaking changes.

#### Compatibility Matrix: [^3] \\[!toc]

|                                           |  Major | Minor | Patch |
| ----------------------------------------- | :----: | :---: | :---: |
| Client-Server wire Compatibility          |    N   |   Y   |   Y   |
| Server-Server Compatibility               |    N   |   Y   |   Y   |
| File Format Compatibility                 | N [^4] |   Y   |   Y   |
| Client API Compatibility                  |    N   |   Y   |   Y   |
| Client Binary Compatibility               |    N   |   N   |   Y   |
| **Server-Side Limited API Compatibility** |        |       |       |
| → Stable                                  |    N   |   Y   |   Y   |
| → Evolving                                |    N   |   N   |   Y   |
| → Unstable                                |    N   |   N   |   N   |
| Dependency Compatibility                  |    N   |   Y   |   Y   |
| Operational Compatibility                 |    N   |   N   |   Y   |

<Callout type="warn">
  HBase 1.7.0 release violated client-server wire compatibility guarantees and was subsequently
  withdrawn after the incompatibilities were reported and fixed in 1.7.1. If you are considering an
  upgrade to 1.7.x line, see [Upgrading to 1.7.1+](/docs/upgrading/paths#upgrading-to-171).
</Callout>

## HBase API Surface

HBase has a lot of API points, but for the compatibility matrix above, we differentiate between Client API, Limited Private API, and Private API. HBase uses [Apache Yetus Audience Annotations](https://yetus.apache.org/documentation/in-progress/interface-classification/) to guide downstream expectations for stability.

* InterfaceAudience ([javadocs](https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceAudience.html)): captures the intended audience, possible values include:
  * Public: safe for end users and external projects
  * LimitedPrivate: used for internals we expect to be pluggable, such as coprocessors
  * Private: strictly for use within HBase itself Classes which are defined as \`IA.Private\` may be used as parameters or return values for interfaces which are declared \`IA.LimitedPrivate\`. Treat the \`IA.Private\` object as opaque; do not try to access its methods or fields directly.
* InterfaceStability ([javadocs](https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceStability.html)): describes what types of interface changes are permitted. Possible values include:
  * Stable: the interface is fixed and is not expected to change
  * Evolving: the interface may change in future minor versions
  * Unstable: the interface may change at any time

Please keep in mind the following interactions between the \`InterfaceAudience\` and \`InterfaceStability\` annotations within the HBase project:

* \`IA.Public\` classes are inherently stable and adhere to our stability guarantees relating to the type of upgrade (major, minor, or patch).
* \`IA.LimitedPrivate\` classes should always be annotated with one of the given \`InterfaceStability\` values. If they are not, you should presume they are \`IS.Unstable\`.
* \`IA.Private\` classes should be considered implicitly unstable, with no guarantee of stability between releases.

### HBase Client API

HBase Client API consists of all the classes or methods that are marked with InterfaceAudience.Public interface. All main classes in hbase-client and dependent modules have either InterfaceAudience.Public, InterfaceAudience.LimitedPrivate, or InterfaceAudience.Private marker. Not all classes in other modules (hbase-server, etc) have the marker. If a class is not annotated with one of these, it is assumed to be a InterfaceAudience.Private class.

### HBase LimitedPrivate API

LimitedPrivate annotation comes with a set of target consumers for the interfaces. Those consumers are coprocessors, phoenix, replication endpoint implementations or similar. At this point, HBase only guarantees source and binary compatibility for these interfaces between patch versions.

### HBase Private API

All classes annotated with InterfaceAudience.Private or all classes that do not have the annotation are for HBase internal use only. The interfaces and method signatures can change at any point in time. If you are relying on a particular interface that is marked Private, you should open a jira to propose changing the interface to be Public or LimitedPrivate, or an interface exposed for this purpose.

### Binary Compatibility

When we say two HBase versions are compatible, we mean that the versions are wire and binary compatible. Compatible HBase versions means that clients can talk to compatible but differently versioned servers. It means too that you can just swap out the jars of one version and replace them with the jars of another, compatible version and all will just work. Unless otherwise specified, HBase point versions are (mostly) binary compatible. You can safely do rolling upgrades between binary compatible versions; i.e. across maintenance releases: e.g. from 1.4.4 to 1.4.6. See "Does compatibility between versions also mean binary compatibility?" discussion on the HBase dev mailing list.

[^1]: See 'Source Compatibility' [https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility](https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility)

[^2]: See [http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html](http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html).

[^3]: Note that this indicates what could break, not that it will break. We will/should add specifics in our release notes.

[^4]: Running an offline upgrade tool without downgrade might be needed. We will typically only support migrating data from major version X to major version X+1.
`,l={title:"HBase version number and compatibility",description:"Understanding HBase semantic versioning scheme and compatibility guarantees across major, minor, and patch versions."},c=[{href:"http://semver.org/"},{href:"/docs/upgrading/paths#upgrading-to-171"},{href:"https://yetus.apache.org/documentation/in-progress/interface-classification/"},{href:"https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceAudience.html"},{href:"https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceStability.html"},{href:"https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility"},{href:"http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html"}],d={contents:[{heading:"aspirational-semantic-versioning",content:"Starting with the 1.0.0 release, HBase is working towards Semantic Versioning for its release versioning. In summary:"},{heading:"given-a-version-number-majorminorpatch-increment-the-toc",content:"MAJOR version when you make incompatible API changes,"},{heading:"given-a-version-number-majorminorpatch-increment-the-toc",content:"MINOR version when you add functionality in a backwards-compatible manner, and"},{heading:"given-a-version-number-majorminorpatch-increment-the-toc",content:"PATCH version when you make backwards-compatible bug fixes."},{heading:"given-a-version-number-majorminorpatch-increment-the-toc",content:"Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format."},{heading:"compatibility-dimensions-toc",content:"In addition to the usual API versioning considerations HBase has other compatibility dimensions that we need to consider."},{heading:"client-server-wire-protocol-compatibility-toc",content:"Allows updating client and server out of sync."},{heading:"client-server-wire-protocol-compatibility-toc",content:"We could only allow upgrading the server first. I.e. the server would be backward compatible to an old client, that way new APIs are OK."},{heading:"client-server-wire-protocol-compatibility-toc",content:"Example: A user should be able to use an old client to connect to an upgraded cluster."},{heading:"server-server-protocol-compatibility-toc",content:"Servers of different versions can co-exist in the same cluster."},{heading:"server-server-protocol-compatibility-toc",content:"The wire protocol between servers is compatible."},{heading:"server-server-protocol-compatibility-toc",content:"Workers for distributed tasks, such as replication and log splitting, can co-exist in the same cluster."},{heading:"server-server-protocol-compatibility-toc",content:"Dependent protocols (such as using ZK for coordination) will also not be changed."},{heading:"server-server-protocol-compatibility-toc",content:"Example: A user can perform a rolling upgrade."},{heading:"file-format-compatibility-toc",content:"Support file formats backward and forward compatible"},{heading:"file-format-compatibility-toc",content:"Example: File, ZK encoding, directory layout is upgraded automatically as part of an HBase upgrade. User can downgrade to the older version and everything will continue to work."},{heading:"client-api-compatibility-toc",content:"Allow changing or removing existing client APIs."},{heading:"client-api-compatibility-toc",content:"An API needs to be deprecated for a whole major version before we will change/remove it."},{heading:"client-api-compatibility-toc",content:"An example: An API was deprecated in 2.0.1 and will be marked for deletion in 4.0.0. On the other hand, an API deprecated in 2.0.0 can be removed in 3.0.0."},{heading:"client-api-compatibility-toc",content:"Occasionally mistakes are made and internal classes are marked with a higher access level than they should. In these rare circumstances, we will accelerate the deprecation schedule to the next major version (i.e., deprecated in 2.2.x, marked IA.Private 3.0.0). Such changes are communicated and explained via release note in Jira."},{heading:"client-api-compatibility-toc",content:"APIs available in a patch version will be available in all later patch versions. However, new APIs may be added which will not be available in earlier patch versions."},{heading:"client-api-compatibility-toc",content:"New APIs introduced in a patch version will only be added in a source compatible way: i.e. code that implements public APIs will continue to compile."},{heading:"client-api-compatibility-toc",content:"Example: A user using a newly deprecated API does not need to modify application code with HBase API calls until the next major version. *"},{heading:"client-binary-compatibility-toc",content:"Client code written to APIs available in a given patch release can run unchanged (no recompilation needed) against the new jars of later patch versions."},{heading:"client-binary-compatibility-toc",content:"Client code written to APIs available in a given patch release might not run against the old jars from an earlier patch version."},{heading:"client-binary-compatibility-toc",content:"Example: Old compiled client code will work unchanged with the new jars."},{heading:"client-binary-compatibility-toc",content:"If a Client implements an HBase Interface, a recompile MAY be required upgrading to a newer minor version (See release notes for warning about incompatible changes). All effort will be made to provide a default implementation so this case should not arise."},{heading:"server-side-limited-api-compatibility-taken-from-hadoop-toc",content:"Internal APIs are marked as Stable, Evolving, or Unstable"},{heading:"server-side-limited-api-compatibility-taken-from-hadoop-toc",content:"This implies binary compatibility for coprocessors and plugins (pluggable classes, including replication) as long as these are only using marked interfaces/classes."},{heading:"server-side-limited-api-compatibility-taken-from-hadoop-toc",content:"Example: Old compiled Coprocessor, Filter, or Plugin code will work unchanged with the new jars."},{heading:"dependency-compatibility-toc",content:"An upgrade of HBase will not require an incompatible upgrade of a dependent project, except for Apache Hadoop."},{heading:"dependency-compatibility-toc",content:"An upgrade of HBase will not require an incompatible upgrade of the Java runtime."},{heading:"dependency-compatibility-toc",content:"Example: Upgrading HBase to a version that supports Dependency Compatibility won't require that you upgrade your Apache ZooKeeper service."},{heading:"dependency-compatibility-toc",content:"Example: If your current version of HBase supported running on JDK 8, then an upgrade to a version that supports Dependency Compatibility will also run on JDK 8."},{heading:"dependency-compatibility-toc",content:"type: tip"},{heading:"dependency-compatibility-toc",content:`Previously, we tried to maintain dependency compatibility for the underly Hadoop service but over
the last few years this has proven untenable. While the HBase project attempts to maintain support
for older versions of Hadoop, we drop the "supported" designator for minor versions that fail to
continue to see releases. Additionally, the Hadoop project has its own set of compatibility
guidelines, which means in some cases having to update to a newer supported minor release might
break some of our compatibility promises.`},{heading:"operational-compatibility-toc",content:"Metric changes"},{heading:"operational-compatibility-toc",content:"Behavioral changes of services"},{heading:"operational-compatibility-toc",content:"JMX APIs exposed via the /jmx/ endpoint"},{heading:"summary-toc",content:"A patch upgrade is a drop-in replacement. Any change that is not Java binary and source compatible would not be allowed. Downgrading versions within patch releases may not be compatible."},{heading:"summary-toc",content:"A minor upgrade requires no application/client code modification. Ideally it would be a drop-in replacement but client code, coprocessors, filters, etc might have to be recompiled if new jars are used."},{heading:"summary-toc",content:"A major upgrade allows the HBase community to make breaking changes."},{heading:"compatibility-matrix--toc",content:"Major"},{heading:"compatibility-matrix--toc",content:"Minor"},{heading:"compatibility-matrix--toc",content:"Patch"},{heading:"compatibility-matrix--toc",content:"Client-Server wire Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Server-Server Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"File Format Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Client API Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Client Binary Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Server-Side Limited API Compatibility"},{heading:"compatibility-matrix--toc",content:"→ Stable"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"→ Evolving"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"→ Unstable"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Dependency Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"Operational Compatibility"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"N"},{heading:"compatibility-matrix--toc",content:"Y"},{heading:"compatibility-matrix--toc",content:"type: warn"},{heading:"compatibility-matrix--toc",content:`HBase 1.7.0 release violated client-server wire compatibility guarantees and was subsequently
withdrawn after the incompatibilities were reported and fixed in 1.7.1. If you are considering an
upgrade to 1.7.x line, see Upgrading to 1.7.1+.`},{heading:"hbase-api-surface",content:"HBase has a lot of API points, but for the compatibility matrix above, we differentiate between Client API, Limited Private API, and Private API. HBase uses Apache Yetus Audience Annotations to guide downstream expectations for stability."},{heading:"hbase-api-surface",content:"InterfaceAudience (javadocs): captures the intended audience, possible values include:"},{heading:"hbase-api-surface",content:"Public: safe for end users and external projects"},{heading:"hbase-api-surface",content:"LimitedPrivate: used for internals we expect to be pluggable, such as coprocessors"},{heading:"hbase-api-surface",content:"Private: strictly for use within HBase itself Classes which are defined as IA.Private may be used as parameters or return values for interfaces which are declared IA.LimitedPrivate. Treat the IA.Private object as opaque; do not try to access its methods or fields directly."},{heading:"hbase-api-surface",content:"InterfaceStability (javadocs): describes what types of interface changes are permitted. Possible values include:"},{heading:"hbase-api-surface",content:"Stable: the interface is fixed and is not expected to change"},{heading:"hbase-api-surface",content:"Evolving: the interface may change in future minor versions"},{heading:"hbase-api-surface",content:"Unstable: the interface may change at any time"},{heading:"hbase-api-surface",content:"Please keep in mind the following interactions between the InterfaceAudience and InterfaceStability annotations within the HBase project:"},{heading:"hbase-api-surface",content:"IA.Public classes are inherently stable and adhere to our stability guarantees relating to the type of upgrade (major, minor, or patch)."},{heading:"hbase-api-surface",content:"IA.LimitedPrivate classes should always be annotated with one of the given InterfaceStability values. If they are not, you should presume they are IS.Unstable."},{heading:"hbase-api-surface",content:"IA.Private classes should be considered implicitly unstable, with no guarantee of stability between releases."},{heading:"hbase-client-api",content:"HBase Client API consists of all the classes or methods that are marked with InterfaceAudience.Public interface. All main classes in hbase-client and dependent modules have either InterfaceAudience.Public, InterfaceAudience.LimitedPrivate, or InterfaceAudience.Private marker. Not all classes in other modules (hbase-server, etc) have the marker. If a class is not annotated with one of these, it is assumed to be a InterfaceAudience.Private class."},{heading:"hbase-limitedprivate-api",content:"LimitedPrivate annotation comes with a set of target consumers for the interfaces. Those consumers are coprocessors, phoenix, replication endpoint implementations or similar. At this point, HBase only guarantees source and binary compatibility for these interfaces between patch versions."},{heading:"hbase-private-api",content:"All classes annotated with InterfaceAudience.Private or all classes that do not have the annotation are for HBase internal use only. The interfaces and method signatures can change at any point in time. If you are relying on a particular interface that is marked Private, you should open a jira to propose changing the interface to be Public or LimitedPrivate, or an interface exposed for this purpose."},{heading:"binary-compatibility",content:'When we say two HBase versions are compatible, we mean that the versions are wire and binary compatible. Compatible HBase versions means that clients can talk to compatible but differently versioned servers. It means too that you can just swap out the jars of one version and replace them with the jars of another, compatible version and all will just work. Unless otherwise specified, HBase point versions are (mostly) binary compatible. You can safely do rolling upgrades between binary compatible versions; i.e. across maintenance releases: e.g. from 1.4.4 to 1.4.6. See "Does compatibility between versions also mean binary compatibility?" discussion on the HBase dev mailing list.'},{heading:"binary-compatibility",content:"See 'Source Compatibility' https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility"},{heading:"binary-compatibility",content:"See http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html."},{heading:"binary-compatibility",content:"Note that this indicates what could break, not that it will break. We will/should add specifics in our release notes."},{heading:"binary-compatibility",content:"Running an offline upgrade tool without downgrade might be needed. We will typically only support migrating data from major version X to major version X+1."}],headings:[{id:"aspirational-semantic-versioning",content:"Aspirational Semantic Versioning"},{id:"given-a-version-number-majorminorpatch-increment-the-toc",content:"Given a version number MAJOR.MINOR.PATCH, increment the: [!toc]"},{id:"compatibility-dimensions-toc",content:"Compatibility Dimensions [!toc]"},{id:"client-server-wire-protocol-compatibility-toc",content:"Client-Server wire protocol compatibility [!toc]"},{id:"server-server-protocol-compatibility-toc",content:"Server-Server protocol compatibility [!toc]"},{id:"file-format-compatibility-toc",content:"File format compatibility [!toc]"},{id:"client-api-compatibility-toc",content:"Client API compatibility [!toc]"},{id:"client-binary-compatibility-toc",content:"Client Binary compatibility [!toc]"},{id:"server-side-limited-api-compatibility-taken-from-hadoop-toc",content:"Server-Side Limited API compatibility (taken from Hadoop) [!toc]"},{id:"dependency-compatibility-toc",content:"Dependency Compatibility [!toc]"},{id:"operational-compatibility-toc",content:"Operational Compatibility [!toc]"},{id:"summary-toc",content:"Summary [!toc]"},{id:"compatibility-matrix--toc",content:"Compatibility Matrix:  [!toc]"},{id:"hbase-api-surface",content:"HBase API Surface"},{id:"hbase-client-api",content:"HBase Client API"},{id:"hbase-limitedprivate-api",content:"HBase LimitedPrivate API"},{id:"hbase-private-api",content:"HBase Private API"},{id:"binary-compatibility",content:"Binary Compatibility"}]};const h=[{depth:2,url:"#aspirational-semantic-versioning",title:e.jsx(e.Fragment,{children:"Aspirational Semantic Versioning"})},{depth:2,url:"#hbase-api-surface",title:e.jsx(e.Fragment,{children:"HBase API Surface"})},{depth:3,url:"#hbase-client-api",title:e.jsx(e.Fragment,{children:"HBase Client API"})},{depth:3,url:"#hbase-limitedprivate-api",title:e.jsx(e.Fragment,{children:"HBase LimitedPrivate API"})},{depth:3,url:"#hbase-private-api",title:e.jsx(e.Fragment,{children:"HBase Private API"})},{depth:3,url:"#binary-compatibility",title:e.jsx(e.Fragment,{children:"Binary Compatibility"})},{depth:2,url:"#footnote-label",title:e.jsx(e.Fragment,{children:"Footnotes"})}];function a(i){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",section:"section",strong:"strong",sup:"sup",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:n}=t;return n||o("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"aspirational-semantic-versioning",children:"Aspirational Semantic Versioning"}),`
`,e.jsxs(t.p,{children:["Starting with the 1.0.0 release, HBase is working towards ",e.jsx(t.a,{href:"http://semver.org/",children:"Semantic Versioning"})," for its release versioning. In summary:"]}),`
`,e.jsx(t.h4,{id:"given-a-version-number-majorminorpatch-increment-the-toc",children:"Given a version number MAJOR.MINOR.PATCH, increment the:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"MAJOR version when you make incompatible API changes,"}),`
`,e.jsx(t.li,{children:"MINOR version when you add functionality in a backwards-compatible manner, and"}),`
`,e.jsx(t.li,{children:"PATCH version when you make backwards-compatible bug fixes."}),`
`,e.jsx(t.li,{children:"Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format."}),`
`]}),`
`,e.jsx(t.h4,{id:"compatibility-dimensions-toc",children:"Compatibility Dimensions"}),`
`,e.jsx(t.p,{children:"In addition to the usual API versioning considerations HBase has other compatibility dimensions that we need to consider."}),`
`,e.jsx(t.h4,{id:"client-server-wire-protocol-compatibility-toc",children:"Client-Server wire protocol compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Allows updating client and server out of sync."}),`
`,e.jsx(t.li,{children:"We could only allow upgrading the server first. I.e. the server would be backward compatible to an old client, that way new APIs are OK."}),`
`,e.jsx(t.li,{children:"Example: A user should be able to use an old client to connect to an upgraded cluster."}),`
`]}),`
`,e.jsx(t.h4,{id:"server-server-protocol-compatibility-toc",children:"Server-Server protocol compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Servers of different versions can co-exist in the same cluster."}),`
`,e.jsx(t.li,{children:"The wire protocol between servers is compatible."}),`
`,e.jsx(t.li,{children:"Workers for distributed tasks, such as replication and log splitting, can co-exist in the same cluster."}),`
`,e.jsx(t.li,{children:"Dependent protocols (such as using ZK for coordination) will also not be changed."}),`
`,e.jsx(t.li,{children:"Example: A user can perform a rolling upgrade."}),`
`]}),`
`,e.jsx(t.h4,{id:"file-format-compatibility-toc",children:"File format compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Support file formats backward and forward compatible"}),`
`,e.jsx(t.li,{children:"Example: File, ZK encoding, directory layout is upgraded automatically as part of an HBase upgrade. User can downgrade to the older version and everything will continue to work."}),`
`]}),`
`,e.jsx(t.h4,{id:"client-api-compatibility-toc",children:"Client API compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Allow changing or removing existing client APIs."}),`
`,e.jsxs(t.li,{children:["An API needs to be deprecated for a whole major version before we will change/remove it.",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"An example: An API was deprecated in 2.0.1 and will be marked for deletion in 4.0.0. On the other hand, an API deprecated in 2.0.0 can be removed in 3.0.0."}),`
`,e.jsxs(t.li,{children:["Occasionally mistakes are made and internal classes are marked with a higher access level than they should. In these rare circumstances, we will accelerate the deprecation schedule to the next major version (i.e., deprecated in 2.2.x, marked ",e.jsx(t.code,{children:"IA.Private"})," 3.0.0). Such changes are communicated and explained via release note in Jira."]}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:"APIs available in a patch version will be available in all later patch versions. However, new APIs may be added which will not be available in earlier patch versions."}),`
`,e.jsxs(t.li,{children:["New APIs introduced in a patch version will only be added in a source compatible way: i.e. code that implements public APIs will continue to compile. ",e.jsx(t.sup,{children:e.jsx(t.a,{href:"#user-content-fn-1",id:"user-content-fnref-1","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"1"})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Example: A user using a newly deprecated API does not need to modify application code with HBase API calls until the next major version. *"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(t.h4,{id:"client-binary-compatibility-toc",children:"Client Binary compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Client code written to APIs available in a given patch release can run unchanged (no recompilation needed) against the new jars of later patch versions."}),`
`,e.jsxs(t.li,{children:["Client code written to APIs available in a given patch release might not run against the old jars from an earlier patch version.",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Example: Old compiled client code will work unchanged with the new jars."}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:"If a Client implements an HBase Interface, a recompile MAY be required upgrading to a newer minor version (See release notes for warning about incompatible changes). All effort will be made to provide a default implementation so this case should not arise."}),`
`]}),`
`,e.jsx(t.h4,{id:"server-side-limited-api-compatibility-taken-from-hadoop-toc",children:"Server-Side Limited API compatibility (taken from Hadoop)"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Internal APIs are marked as Stable, Evolving, or Unstable"}),`
`,e.jsx(t.li,{children:"This implies binary compatibility for coprocessors and plugins (pluggable classes, including replication) as long as these are only using marked interfaces/classes."}),`
`,e.jsx(t.li,{children:"Example: Old compiled Coprocessor, Filter, or Plugin code will work unchanged with the new jars."}),`
`]}),`
`,e.jsx(t.h4,{id:"dependency-compatibility-toc",children:"Dependency Compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"An upgrade of HBase will not require an incompatible upgrade of a dependent project, except for Apache Hadoop."}),`
`,e.jsx(t.li,{children:"An upgrade of HBase will not require an incompatible upgrade of the Java runtime."}),`
`,e.jsxs(t.li,{children:["Example: Upgrading HBase to a version that supports ",e.jsx(t.em,{children:"Dependency Compatibility"})," won't require that you upgrade your Apache ZooKeeper service."]}),`
`,e.jsxs(t.li,{children:["Example: If your current version of HBase supported running on JDK 8, then an upgrade to a version that supports ",e.jsx(t.em,{children:"Dependency Compatibility"})," will also run on JDK 8."]}),`
`]}),`
`,e.jsx(n,{type:"tip",children:e.jsx(t.p,{children:`Previously, we tried to maintain dependency compatibility for the underly Hadoop service but over
the last few years this has proven untenable. While the HBase project attempts to maintain support
for older versions of Hadoop, we drop the "supported" designator for minor versions that fail to
continue to see releases. Additionally, the Hadoop project has its own set of compatibility
guidelines, which means in some cases having to update to a newer supported minor release might
break some of our compatibility promises.`})}),`
`,e.jsx(t.h4,{id:"operational-compatibility-toc",children:"Operational Compatibility"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Metric changes"}),`
`,e.jsx(t.li,{children:"Behavioral changes of services"}),`
`,e.jsxs(t.li,{children:["JMX APIs exposed via the ",e.jsx(t.code,{children:"/jmx/"})," endpoint"]}),`
`]}),`
`,e.jsx(t.h4,{id:"summary-toc",children:"Summary"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["A patch upgrade is a drop-in replacement. Any change that is not Java binary and source compatible would not be allowed.",e.jsx(t.sup,{children:e.jsx(t.a,{href:"#user-content-fn-2",id:"user-content-fnref-2","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"2"})})," Downgrading versions within patch releases may not be compatible."]}),`
`,e.jsx(t.li,{children:"A minor upgrade requires no application/client code modification. Ideally it would be a drop-in replacement but client code, coprocessors, filters, etc might have to be recompiled if new jars are used."}),`
`,e.jsx(t.li,{children:"A major upgrade allows the HBase community to make breaking changes."}),`
`]}),`
`,e.jsxs(t.h4,{id:"compatibility-matrix--toc",children:["Compatibility Matrix: ",e.jsx(t.sup,{children:e.jsx(t.a,{href:"#user-content-fn-3",id:"user-content-fnref-3","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"3"})})]}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{}),e.jsx(t.th,{style:{textAlign:"center"},children:"Major"}),e.jsx(t.th,{style:{textAlign:"center"},children:"Minor"}),e.jsx(t.th,{style:{textAlign:"center"},children:"Patch"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Client-Server wire Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Server-Server Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"File Format Compatibility"}),e.jsxs(t.td,{style:{textAlign:"center"},children:["N ",e.jsx(t.sup,{children:e.jsx(t.a,{href:"#user-content-fn-4",id:"user-content-fnref-4","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"4"})})]}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Client API Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Client Binary Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Server-Side Limited API Compatibility"})}),e.jsx(t.td,{style:{textAlign:"center"}}),e.jsx(t.td,{style:{textAlign:"center"}}),e.jsx(t.td,{style:{textAlign:"center"}})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"→ Stable"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"→ Evolving"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"→ Unstable"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Dependency Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Operational Compatibility"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"N"}),e.jsx(t.td,{style:{textAlign:"center"},children:"Y"})]})]})]}),`
`,e.jsx(n,{type:"warn",children:e.jsxs(t.p,{children:[`HBase 1.7.0 release violated client-server wire compatibility guarantees and was subsequently
withdrawn after the incompatibilities were reported and fixed in 1.7.1. If you are considering an
upgrade to 1.7.x line, see `,e.jsx(t.a,{href:"/docs/upgrading/paths#upgrading-to-171",children:"Upgrading to 1.7.1+"}),"."]})}),`
`,e.jsx(t.h2,{id:"hbase-api-surface",children:"HBase API Surface"}),`
`,e.jsxs(t.p,{children:["HBase has a lot of API points, but for the compatibility matrix above, we differentiate between Client API, Limited Private API, and Private API. HBase uses ",e.jsx(t.a,{href:"https://yetus.apache.org/documentation/in-progress/interface-classification/",children:"Apache Yetus Audience Annotations"})," to guide downstream expectations for stability."]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["InterfaceAudience (",e.jsx(t.a,{href:"https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceAudience.html",children:"javadocs"}),"): captures the intended audience, possible values include:",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Public: safe for end users and external projects"}),`
`,e.jsx(t.li,{children:"LimitedPrivate: used for internals we expect to be pluggable, such as coprocessors"}),`
`,e.jsxs(t.li,{children:["Private: strictly for use within HBase itself Classes which are defined as ",e.jsx(t.code,{children:"IA.Private"})," may be used as parameters or return values for interfaces which are declared ",e.jsx(t.code,{children:"IA.LimitedPrivate"}),". Treat the ",e.jsx(t.code,{children:"IA.Private"})," object as opaque; do not try to access its methods or fields directly."]}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:["InterfaceStability (",e.jsx(t.a,{href:"https://yetus.apache.org/documentation/in-progress/javadocs/org/apache/yetus/audience/InterfaceStability.html",children:"javadocs"}),"): describes what types of interface changes are permitted. Possible values include:",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Stable: the interface is fixed and is not expected to change"}),`
`,e.jsx(t.li,{children:"Evolving: the interface may change in future minor versions"}),`
`,e.jsx(t.li,{children:"Unstable: the interface may change at any time"}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(t.p,{children:["Please keep in mind the following interactions between the ",e.jsx(t.code,{children:"InterfaceAudience"})," and ",e.jsx(t.code,{children:"InterfaceStability"})," annotations within the HBase project:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"IA.Public"})," classes are inherently stable and adhere to our stability guarantees relating to the type of upgrade (major, minor, or patch)."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"IA.LimitedPrivate"})," classes should always be annotated with one of the given ",e.jsx(t.code,{children:"InterfaceStability"})," values. If they are not, you should presume they are ",e.jsx(t.code,{children:"IS.Unstable"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"IA.Private"})," classes should be considered implicitly unstable, with no guarantee of stability between releases."]}),`
`]}),`
`,e.jsx(t.h3,{id:"hbase-client-api",children:"HBase Client API"}),`
`,e.jsx(t.p,{children:"HBase Client API consists of all the classes or methods that are marked with InterfaceAudience.Public interface. All main classes in hbase-client and dependent modules have either InterfaceAudience.Public, InterfaceAudience.LimitedPrivate, or InterfaceAudience.Private marker. Not all classes in other modules (hbase-server, etc) have the marker. If a class is not annotated with one of these, it is assumed to be a InterfaceAudience.Private class."}),`
`,e.jsx(t.h3,{id:"hbase-limitedprivate-api",children:"HBase LimitedPrivate API"}),`
`,e.jsx(t.p,{children:"LimitedPrivate annotation comes with a set of target consumers for the interfaces. Those consumers are coprocessors, phoenix, replication endpoint implementations or similar. At this point, HBase only guarantees source and binary compatibility for these interfaces between patch versions."}),`
`,e.jsx(t.h3,{id:"hbase-private-api",children:"HBase Private API"}),`
`,e.jsx(t.p,{children:"All classes annotated with InterfaceAudience.Private or all classes that do not have the annotation are for HBase internal use only. The interfaces and method signatures can change at any point in time. If you are relying on a particular interface that is marked Private, you should open a jira to propose changing the interface to be Public or LimitedPrivate, or an interface exposed for this purpose."}),`
`,e.jsx(t.h3,{id:"binary-compatibility",children:"Binary Compatibility"}),`
`,e.jsx(t.p,{children:'When we say two HBase versions are compatible, we mean that the versions are wire and binary compatible. Compatible HBase versions means that clients can talk to compatible but differently versioned servers. It means too that you can just swap out the jars of one version and replace them with the jars of another, compatible version and all will just work. Unless otherwise specified, HBase point versions are (mostly) binary compatible. You can safely do rolling upgrades between binary compatible versions; i.e. across maintenance releases: e.g. from 1.4.4 to 1.4.6. See "Does compatibility between versions also mean binary compatibility?" discussion on the HBase dev mailing list.'}),`
`,e.jsxs(t.section,{"data-footnotes":!0,className:"footnotes",children:[e.jsx(t.h2,{className:"sr-only",id:"footnote-label",children:"Footnotes"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{id:"user-content-fn-1",children:[`
`,e.jsxs(t.p,{children:["See 'Source Compatibility' ",e.jsx(t.a,{href:"https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility",children:"https://wiki.openjdk.org/spaces/csr/pages/32342052/Kinds+of+Compatibility"})," ",e.jsx(t.a,{href:"#user-content-fnref-1","data-footnote-backref":"","aria-label":"Back to reference 1",className:"data-footnote-backref",children:"↩"})]}),`
`]}),`
`,e.jsxs(t.li,{id:"user-content-fn-2",children:[`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html",children:"http://docs.oracle.com/javase/specs/jls/se8/html/jls-13.html"}),". ",e.jsx(t.a,{href:"#user-content-fnref-2","data-footnote-backref":"","aria-label":"Back to reference 2",className:"data-footnote-backref",children:"↩"})]}),`
`]}),`
`,e.jsxs(t.li,{id:"user-content-fn-3",children:[`
`,e.jsxs(t.p,{children:["Note that this indicates what could break, not that it will break. We will/should add specifics in our release notes. ",e.jsx(t.a,{href:"#user-content-fnref-3","data-footnote-backref":"","aria-label":"Back to reference 3",className:"data-footnote-backref",children:"↩"})]}),`
`]}),`
`,e.jsxs(t.li,{id:"user-content-fn-4",children:[`
`,e.jsxs(t.p,{children:["Running an offline upgrade tool without downgrade might be needed. We will typically only support migrating data from major version X to major version X+1. ",e.jsx(t.a,{href:"#user-content-fnref-4","data-footnote-backref":"","aria-label":"Back to reference 4",className:"data-footnote-backref",children:"↩"})]}),`
`]}),`
`]}),`
`]})]})}function p(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function o(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{s as _markdown,p as default,c as extractedReferences,l as frontmatter,d as structuredData,h as toc};
