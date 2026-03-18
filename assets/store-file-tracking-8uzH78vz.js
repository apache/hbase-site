import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`## Overview

Historically, HBase internals have relied on creating hfiles on temporary directories first, renaming
those files to the actual store directory at operation commit time. That's a simple and convenient
way to separate transient from already finalised files that are ready to serve client reads with data.
This approach works well with strong consistent file systems, but with the popularity of less consistent
file systems, mainly Object Store which can be used like file systems, dependency on atomic rename operations starts to introduce performance penalties. The Amazon S3 Object Store, in particular, has been the most affected deployment,
due to its lack of atomic renames. The HBase community temporarily bypassed this problem by building a distributed locking layer called HBOSS, to guarantee atomicity of operations against S3.

With **Store File Tracking**, decision on where to originally create new hfiles and how to proceed upon
commit is delegated to the specific Store File Tracking implementation.
The implementation can be set at the HBase service leve in **hbase-site.xml** or at the
Table or Column Family via the TableDescriptor configuration.

<Callout type="info">
  When the store file tracking implementation is specified in **hbase\\_site.xml**, this configuration
  is also propagated into a tables configuration at table creation time. This is to avoid dangerous
  configuration mismatches between processes, which could potentially lead to data loss.
</Callout>

## Available Implementations

Store File Tracking initial version provides three builtin implementations:

* DEFAULT
* FILE
* MIGRATION

### DEFAULT

As per the name, this is the Store File Tracking implementation used by default when no explicit
configuration has been defined. The DEFAULT tracker implements the standard approach using temporary
directories and renames. This is how all previous (implicit) implementation that HBase used to track store files.

### FILE

A file tracker implementation that creates new files straight in the store directory, avoiding the
need for rename operations. It keeps a list of committed hfiles in memory, backed by meta files, in
each store directory. Whenever a new hfile is committed, the list of *tracked files* in the given
store is updated and a new meta file is written with this list contents, discarding the previous
meta file now containing an out dated list.

### MIGRATION

A special implementation to be used when swapping between Store File Tracking implementations on
pre-existing tables that already contain data, and therefore, files being tracked under an specific
logic.

## Usage

For fresh deployments that don't yet contain any user data, **FILE** implementation can be just set as
value for **hbase.store.file-tracker.impl** property in global **hbase-site.xml** configuration, prior
to the first hbase start. Omitting this property sets the **DEFAULT** implementation.

For clusters with data that are upgraded to a version of HBase containing the store file tracking
feature, the Store File Tracking implementation can only be changed with the **MIGRATION**
implementation, so that the *new tracker* can safely build its list of tracked files based on the
list of the *current tracker*.

<Callout type="info">
  MIGRATION tracker should NOT be set at global configuration. To use it, follow below section about
  setting Store File Tacking at Table or Column Family configuration.
</Callout>

### Configuring for Table or Column Family

Setting Store File Tracking configuration globally may not always be possible or desired, for example,
in the case of upgraded clusters with pre-existing user data.
Store File Tracking can be set at Table or Column Family level configuration.
For example, to specify **FILE** implementation in the table configuration at table creation time,
the following should be applied:

\`\`\`bash
create 'my-table', 'f1', 'f2', {CONFIGURATION => {'hbase.store.file-tracker.impl' => 'FILE'}}
\`\`\`

To define **FILE** for an specific Column Family:

\`\`\`bash
create 'my-table', {NAME=> '1', CONFIGURATION => {'hbase.store.file-tracker.impl' => 'FILE'}}
\`\`\`

### Switching trackers at Table or Column Family

A very common scenario is to set Store File Tracking on pre-existing HBase deployments that have
been upgraded to a version that supports this feature. To apply the FILE tracker, tables effectively
need to be migrated from the DEFAULT tracker to the FILE tracker. As explained previously, such
process requires the usage of the special MIGRATION tracker implementation, which can only be
specified at table or Column Family level.

For example, to switch *tracker* from **DEFAULT** to **FILE** in a table configuration:

\`\`\`bash
alter 'my-table', CONFIGURATION => {'hbase.store.file-tracker.impl' => 'MIGRATION',
'hbase.store.file-tracker.migration.src.impl' => 'DEFAULT',
'hbase.store.file-tracker.migration.dst.impl' => 'FILE'}
\`\`\`

To apply similar switch at column family level configuration:

\`\`\`bash
alter 'my-table', {NAME => 'f1', CONFIGURATION => {'hbase.store.file-tracker.impl' => 'MIGRATION',
'hbase.store.file-tracker.migration.src.impl' => 'DEFAULT',
'hbase.store.file-tracker.migration.dst.impl' => 'FILE'}}
\`\`\`

Once all table regions have been onlined again, don't forget to disable MIGRATION, by now setting
**hbase.store.file-tracker.migration.dst.impl** value as the **hbase.store.file-tracker.impl**. In the above
example, that would be as follows:

\`\`\`bash
alter 'my-table', CONFIGURATION => {'hbase.store.file-tracker.impl' => 'FILE'}
\`\`\`

### Specifying trackers during snapshot recovery

It's also possible to specify a given store file tracking implementation when recovering a snapshot
using the *CLONE\\_SFT* option of *clone\\_snasphot* command. This is useful when recovering old
snapshots, taken prior to a change in the global configuration, or if the snapshot has been
imported from a different cluster that had a different store file tracking setting.
Because snapshots preserve table and colum family descriptors, a simple restore would reload
the original configuration, requiring the additional steps described above to convert the
table/column family to the desired tracker implementation.
An example of how to use *clone\\_snapshot* to specify the **FILE** tracker implementation
is shown below:

\`\`\`bash
clone_snapshot 'snapshotName', 'namespace:tableName', {CLONE_SFT=>'FILE'}
\`\`\`

<Callout type="info">
  The option to specify the tracker during snapshot recovery is only available for the
  *clone\\_snapshot* command. The *restore\\_snapshot* command does not support this parameter.
</Callout>
`,o={title:"Store File Tracking",description:"This feature introduces an abstraction layer to track store files still used/needed by store engines, allowing for plugging different approaches of identifying store files required by the given store."},h=[],c={contents:[{heading:"store-file-tracking-overview",content:`Historically, HBase internals have relied on creating hfiles on temporary directories first, renaming
those files to the actual store directory at operation commit time. That's a simple and convenient
way to separate transient from already finalised files that are ready to serve client reads with data.
This approach works well with strong consistent file systems, but with the popularity of less consistent
file systems, mainly Object Store which can be used like file systems, dependency on atomic rename operations starts to introduce performance penalties. The Amazon S3 Object Store, in particular, has been the most affected deployment,
due to its lack of atomic renames. The HBase community temporarily bypassed this problem by building a distributed locking layer called HBOSS, to guarantee atomicity of operations against S3.`},{heading:"store-file-tracking-overview",content:`With Store File Tracking, decision on where to originally create new hfiles and how to proceed upon
commit is delegated to the specific Store File Tracking implementation.
The implementation can be set at the HBase service leve in hbase-site.xml or at the
Table or Column Family via the TableDescriptor configuration.`},{heading:"store-file-tracking-overview",content:"type: info"},{heading:"store-file-tracking-overview",content:`When the store file tracking implementation is specified in hbase_site.xml, this configuration
is also propagated into a tables configuration at table creation time. This is to avoid dangerous
configuration mismatches between processes, which could potentially lead to data loss.`},{heading:"available-implementations",content:"Store File Tracking initial version provides three builtin implementations:"},{heading:"available-implementations",content:"DEFAULT"},{heading:"available-implementations",content:"FILE"},{heading:"available-implementations",content:"MIGRATION"},{heading:"store-file-tracking-default",content:`As per the name, this is the Store File Tracking implementation used by default when no explicit
configuration has been defined. The DEFAULT tracker implements the standard approach using temporary
directories and renames. This is how all previous (implicit) implementation that HBase used to track store files.`},{heading:"file",content:`A file tracker implementation that creates new files straight in the store directory, avoiding the
need for rename operations. It keeps a list of committed hfiles in memory, backed by meta files, in
each store directory. Whenever a new hfile is committed, the list of tracked files in the given
store is updated and a new meta file is written with this list contents, discarding the previous
meta file now containing an out dated list.`},{heading:"migration",content:`A special implementation to be used when swapping between Store File Tracking implementations on
pre-existing tables that already contain data, and therefore, files being tracked under an specific
logic.`},{heading:"store-file-tracking-usage",content:`For fresh deployments that don't yet contain any user data, FILE implementation can be just set as
value for hbase.store.file-tracker.impl property in global hbase-site.xml configuration, prior
to the first hbase start. Omitting this property sets the DEFAULT implementation.`},{heading:"store-file-tracking-usage",content:`For clusters with data that are upgraded to a version of HBase containing the store file tracking
feature, the Store File Tracking implementation can only be changed with the MIGRATION
implementation, so that the new tracker can safely build its list of tracked files based on the
list of the current tracker.`},{heading:"store-file-tracking-usage",content:"type: info"},{heading:"store-file-tracking-usage",content:`MIGRATION tracker should NOT be set at global configuration. To use it, follow below section about
setting Store File Tacking at Table or Column Family configuration.`},{heading:"configuring-for-table-or-column-family",content:`Setting Store File Tracking configuration globally may not always be possible or desired, for example,
in the case of upgraded clusters with pre-existing user data.
Store File Tracking can be set at Table or Column Family level configuration.
For example, to specify FILE implementation in the table configuration at table creation time,
the following should be applied:`},{heading:"configuring-for-table-or-column-family",content:"To define FILE for an specific Column Family:"},{heading:"switching-trackers-at-table-or-column-family",content:`A very common scenario is to set Store File Tracking on pre-existing HBase deployments that have
been upgraded to a version that supports this feature. To apply the FILE tracker, tables effectively
need to be migrated from the DEFAULT tracker to the FILE tracker. As explained previously, such
process requires the usage of the special MIGRATION tracker implementation, which can only be
specified at table or Column Family level.`},{heading:"switching-trackers-at-table-or-column-family",content:"For example, to switch tracker from DEFAULT to FILE in a table configuration:"},{heading:"switching-trackers-at-table-or-column-family",content:"To apply similar switch at column family level configuration:"},{heading:"switching-trackers-at-table-or-column-family",content:`Once all table regions have been onlined again, don't forget to disable MIGRATION, by now setting
hbase.store.file-tracker.migration.dst.impl value as the hbase.store.file-tracker.impl. In the above
example, that would be as follows:`},{heading:"specifying-trackers-during-snapshot-recovery",content:`It's also possible to specify a given store file tracking implementation when recovering a snapshot
using the CLONE_SFT option of clone_snasphot command. This is useful when recovering old
snapshots, taken prior to a change in the global configuration, or if the snapshot has been
imported from a different cluster that had a different store file tracking setting.
Because snapshots preserve table and colum family descriptors, a simple restore would reload
the original configuration, requiring the additional steps described above to convert the
table/column family to the desired tracker implementation.
An example of how to use clone_snapshot to specify the FILE tracker implementation
is shown below:`},{heading:"specifying-trackers-during-snapshot-recovery",content:"type: info"},{heading:"specifying-trackers-during-snapshot-recovery",content:`The option to specify the tracker during snapshot recovery is only available for the
clone_snapshot command. The restore_snapshot command does not support this parameter.`}],headings:[{id:"store-file-tracking-overview",content:"Overview"},{id:"available-implementations",content:"Available Implementations"},{id:"store-file-tracking-default",content:"DEFAULT"},{id:"file",content:"FILE"},{id:"migration",content:"MIGRATION"},{id:"store-file-tracking-usage",content:"Usage"},{id:"configuring-for-table-or-column-family",content:"Configuring for Table or Column Family"},{id:"switching-trackers-at-table-or-column-family",content:"Switching trackers at Table or Column Family"},{id:"specifying-trackers-during-snapshot-recovery",content:"Specifying trackers during snapshot recovery"}]};const d=[{depth:2,url:"#store-file-tracking-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:2,url:"#available-implementations",title:e.jsx(e.Fragment,{children:"Available Implementations"})},{depth:3,url:"#store-file-tracking-default",title:e.jsx(e.Fragment,{children:"DEFAULT"})},{depth:3,url:"#file",title:e.jsx(e.Fragment,{children:"FILE"})},{depth:3,url:"#migration",title:e.jsx(e.Fragment,{children:"MIGRATION"})},{depth:2,url:"#store-file-tracking-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#configuring-for-table-or-column-family",title:e.jsx(e.Fragment,{children:"Configuring for Table or Column Family"})},{depth:3,url:"#switching-trackers-at-table-or-column-family",title:e.jsx(e.Fragment,{children:"Switching trackers at Table or Column Family"})},{depth:3,url:"#specifying-trackers-during-snapshot-recovery",title:e.jsx(e.Fragment,{children:"Specifying trackers during snapshot recovery"})}];function s(t){const i={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components},{Callout:n}=i;return n||a("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"store-file-tracking-overview",children:"Overview"}),`
`,e.jsx(i.p,{children:`Historically, HBase internals have relied on creating hfiles on temporary directories first, renaming
those files to the actual store directory at operation commit time. That's a simple and convenient
way to separate transient from already finalised files that are ready to serve client reads with data.
This approach works well with strong consistent file systems, but with the popularity of less consistent
file systems, mainly Object Store which can be used like file systems, dependency on atomic rename operations starts to introduce performance penalties. The Amazon S3 Object Store, in particular, has been the most affected deployment,
due to its lack of atomic renames. The HBase community temporarily bypassed this problem by building a distributed locking layer called HBOSS, to guarantee atomicity of operations against S3.`}),`
`,e.jsxs(i.p,{children:["With ",e.jsx(i.strong,{children:"Store File Tracking"}),`, decision on where to originally create new hfiles and how to proceed upon
commit is delegated to the specific Store File Tracking implementation.
The implementation can be set at the HBase service leve in `,e.jsx(i.strong,{children:"hbase-site.xml"}),` or at the
Table or Column Family via the TableDescriptor configuration.`]}),`
`,e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:["When the store file tracking implementation is specified in ",e.jsx(i.strong,{children:"hbase_site.xml"}),`, this configuration
is also propagated into a tables configuration at table creation time. This is to avoid dangerous
configuration mismatches between processes, which could potentially lead to data loss.`]})}),`
`,e.jsx(i.h2,{id:"available-implementations",children:"Available Implementations"}),`
`,e.jsx(i.p,{children:"Store File Tracking initial version provides three builtin implementations:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"DEFAULT"}),`
`,e.jsx(i.li,{children:"FILE"}),`
`,e.jsx(i.li,{children:"MIGRATION"}),`
`]}),`
`,e.jsx(i.h3,{id:"store-file-tracking-default",children:"DEFAULT"}),`
`,e.jsx(i.p,{children:`As per the name, this is the Store File Tracking implementation used by default when no explicit
configuration has been defined. The DEFAULT tracker implements the standard approach using temporary
directories and renames. This is how all previous (implicit) implementation that HBase used to track store files.`}),`
`,e.jsx(i.h3,{id:"file",children:"FILE"}),`
`,e.jsxs(i.p,{children:[`A file tracker implementation that creates new files straight in the store directory, avoiding the
need for rename operations. It keeps a list of committed hfiles in memory, backed by meta files, in
each store directory. Whenever a new hfile is committed, the list of `,e.jsx(i.em,{children:"tracked files"}),` in the given
store is updated and a new meta file is written with this list contents, discarding the previous
meta file now containing an out dated list.`]}),`
`,e.jsx(i.h3,{id:"migration",children:"MIGRATION"}),`
`,e.jsx(i.p,{children:`A special implementation to be used when swapping between Store File Tracking implementations on
pre-existing tables that already contain data, and therefore, files being tracked under an specific
logic.`}),`
`,e.jsx(i.h2,{id:"store-file-tracking-usage",children:"Usage"}),`
`,e.jsxs(i.p,{children:["For fresh deployments that don't yet contain any user data, ",e.jsx(i.strong,{children:"FILE"}),` implementation can be just set as
value for `,e.jsx(i.strong,{children:"hbase.store.file-tracker.impl"})," property in global ",e.jsx(i.strong,{children:"hbase-site.xml"}),` configuration, prior
to the first hbase start. Omitting this property sets the `,e.jsx(i.strong,{children:"DEFAULT"})," implementation."]}),`
`,e.jsxs(i.p,{children:[`For clusters with data that are upgraded to a version of HBase containing the store file tracking
feature, the Store File Tracking implementation can only be changed with the `,e.jsx(i.strong,{children:"MIGRATION"}),`
implementation, so that the `,e.jsx(i.em,{children:"new tracker"}),` can safely build its list of tracked files based on the
list of the `,e.jsx(i.em,{children:"current tracker"}),"."]}),`
`,e.jsx(n,{type:"info",children:e.jsx(i.p,{children:`MIGRATION tracker should NOT be set at global configuration. To use it, follow below section about
setting Store File Tacking at Table or Column Family configuration.`})}),`
`,e.jsx(i.h3,{id:"configuring-for-table-or-column-family",children:"Configuring for Table or Column Family"}),`
`,e.jsxs(i.p,{children:[`Setting Store File Tracking configuration globally may not always be possible or desired, for example,
in the case of upgraded clusters with pre-existing user data.
Store File Tracking can be set at Table or Column Family level configuration.
For example, to specify `,e.jsx(i.strong,{children:"FILE"}),` implementation in the table configuration at table creation time,
the following should be applied:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my-table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f2',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {CONFIGURATION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {'hbase.store.file-tracker.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FILE'}}"})]})})})}),`
`,e.jsxs(i.p,{children:["To define ",e.jsx(i.strong,{children:"FILE"})," for an specific Column Family:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my-table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CONFIGURATION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {'hbase.store.file-tracker.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FILE'}}"})]})})})}),`
`,e.jsx(i.h3,{id:"switching-trackers-at-table-or-column-family",children:"Switching trackers at Table or Column Family"}),`
`,e.jsx(i.p,{children:`A very common scenario is to set Store File Tracking on pre-existing HBase deployments that have
been upgraded to a version that supports this feature. To apply the FILE tracker, tables effectively
need to be migrated from the DEFAULT tracker to the FILE tracker. As explained previously, such
process requires the usage of the special MIGRATION tracker implementation, which can only be
specified at table or Column Family level.`}),`
`,e.jsxs(i.p,{children:["For example, to switch ",e.jsx(i.em,{children:"tracker"})," from ",e.jsx(i.strong,{children:"DEFAULT"})," to ",e.jsx(i.strong,{children:"FILE"})," in a table configuration:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my-table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CONFIGURATION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {'hbase.store.file-tracker.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'MIGRATION',"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"'hbase.store.file-tracker.migration.src.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'DEFAULT',"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"'hbase.store.file-tracker.migration.dst.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FILE'}"})]})]})})}),`
`,e.jsx(i.p,{children:"To apply similar switch at column family level configuration:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my-table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CONFIGURATION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {'hbase.store.file-tracker.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'MIGRATION',"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"'hbase.store.file-tracker.migration.src.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'DEFAULT',"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"'hbase.store.file-tracker.migration.dst.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FILE'}}"})]})]})})}),`
`,e.jsxs(i.p,{children:[`Once all table regions have been onlined again, don't forget to disable MIGRATION, by now setting
`,e.jsx(i.strong,{children:"hbase.store.file-tracker.migration.dst.impl"})," value as the ",e.jsx(i.strong,{children:"hbase.store.file-tracker.impl"}),`. In the above
example, that would be as follows:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my-table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CONFIGURATION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {'hbase.store.file-tracker.impl'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FILE'}"})]})})})}),`
`,e.jsx(i.h3,{id:"specifying-trackers-during-snapshot-recovery",children:"Specifying trackers during snapshot recovery"}),`
`,e.jsxs(i.p,{children:[`It's also possible to specify a given store file tracking implementation when recovering a snapshot
using the `,e.jsx(i.em,{children:"CLONE_SFT"})," option of ",e.jsx(i.em,{children:"clone_snasphot"}),` command. This is useful when recovering old
snapshots, taken prior to a change in the global configuration, or if the snapshot has been
imported from a different cluster that had a different store file tracking setting.
Because snapshots preserve table and colum family descriptors, a simple restore would reload
the original configuration, requiring the additional steps described above to convert the
table/column family to the desired tracker implementation.
An example of how to use `,e.jsx(i.em,{children:"clone_snapshot"})," to specify the ",e.jsx(i.strong,{children:"FILE"}),` tracker implementation
is shown below:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"clone_snapshot"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'snapshotName',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'namespace:tableName',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {CLONE_SFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILE'}"})]})})})}),`
`,e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:[`The option to specify the tracker during snapshot recovery is only available for the
`,e.jsx(i.em,{children:"clone_snapshot"})," command. The ",e.jsx(i.em,{children:"restore_snapshot"})," command does not support this parameter."]})})]})}function p(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(s,{...t})}):s(t)}function a(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,p as default,h as extractedReferences,o as frontmatter,c as structuredData,d as toc};
