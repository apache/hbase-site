import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let t=`In HBase, a scan of a table costs server-side HBase resources reading, formating, and returning data back to the client.
Luckily, HBase provides a TableSnapshotScanner and TableSnapshotInputFormat (introduced by [HBASE-8369](https://issues.apache.org/jira/browse/HBASE-8369)),
which can scan HBase-written HFiles directly in the HDFS filesystem completely by-passing hbase. This access mode
performs better than going via HBase and can be used with an offline HBase with in-place or exported
snapshot HFiles.

To read HFiles directly, the user must have sufficient permissions to access snapshots or in-place hbase HFiles.

## TableSnapshotScanner

TableSnapshotScanner provides a means for running a single client-side scan over snapshot files.
When using TableSnapshotScanner, we must specify a temporary directory to copy the snapshot files into.
The client user should have write permissions to this directory, and the dir should not be a subdirectory of
the hbase.rootdir. The scanner deletes the contents of the directory once the scanner is closed.

### Use TableSnapshotScanner

\`\`\`java
Path restoreDir = new Path("XX"); // restore dir should not be a subdirectory of hbase.rootdir
Scan scan = new Scan();
try (TableSnapshotScanner scanner = new TableSnapshotScanner(conf, restoreDir, snapshotName, scan)) {
    Result result = scanner.next();
    while (result != null) {
        ...
        result = scanner.next();
    }
}
\`\`\`

## TableSnapshotInputFormat

TableSnapshotInputFormat provides a way to scan over snapshot HFiles in a MapReduce job.

### Use TableSnapshotInputFormat

\`\`\`java
Job job = new Job(conf);
Path restoreDir = new Path("XX"); // restore dir should not be a subdirectory of hbase.rootdir
Scan scan = new Scan();
TableMapReduceUtil.initTableSnapshotMapperJob(snapshotName, scan, MyTableMapper.class, MyMapKeyOutput.class, MyMapOutputValueWritable.class, job, true, restoreDir);
\`\`\`

## Permission to access snapshot and data files

Generally, only the HBase owner or the HDFS admin have the permission to access HFiles.

[HBASE-18659](https://issues.apache.org/jira/browse/HBASE-18659) uses HDFS ACLs to make HBase granted user have permission to access snapshot files.

### HDFS ACLs

[HDFS ACLs](https://hadoop.apache.org/docs/r2.7.1/hadoop-project-dist/hadoop-hdfs/HdfsPermissionsGuide.html#ACLs_Access_Control_Lists) supports an "access ACL", which defines the rules to enforce during permission checks, and a "default ACL", which defines the ACL entries that new child files or sub-directories receive automatically during creation. Via HDFS ACLs, HBase syncs granted users with read permission to HFiles.

### Basic idea

The HBase files are organized in the following ways:

* \`{hbase-rootdir}/.tmp/data/{namespace}/{table}\`
* \`{hbase-rootdir}/data/{namespace}/{table}\`
* \`{hbase-rootdir}/archive/data/{namespace}/{table}\`
* \`{hbase-rootdir}/.hbase-snapshot/{snapshotName}\`

So the basic idea is to add or remove HDFS ACLs to files of the global/namespace/table directory
when grant or revoke permission to global/namespace/table.

See the design doc in [HBASE-18659](https://issues.apache.org/jira/browse/HBASE-18659) for more details.

### Configuration to use this feature

* Firstly, make sure that HDFS ACLs are enabled and umask is set to 027

  \`\`\`
  dfs.namenode.acls.enabled = true
  fs.permissions.umask-mode = 027
  \`\`\`

* Add master coprocessor, please make sure the SnapshotScannerHDFSAclController is configured after AccessController

  \`\`\`
  hbase.coprocessor.master.classes = "org.apache.hadoop.hbase.security.access.AccessController
  ,org.apache.hadoop.hbase.security.access.SnapshotScannerHDFSAclController"
  \`\`\`

* Enable this feature

  \`\`\`
  hbase.acl.sync.to.hdfs.enable=true
  \`\`\`

* Modify table scheme to enable this feature for a specified table, this config is
  false by default for every table, this means the HBase granted ACLs will not be synced to HDFS

  \`\`\`ruby
  alter 't1', CONFIGURATION => {'hbase.acl.sync.to.hdfs.enable' => 'true'}
  \`\`\`

### Limitation

There are some limitations for this feature:

* If we enable this feature, some master operations such as grant, revoke, snapshot... (See the design doc for more details) will be slower as we need to sync HDFS ACLs to related hfiles.
* HDFS has a config which limits the max ACL entries num for one directory or file:
  \`\`\`
  dfs.namenode.acls.max.entries = 32(default value)
  \`\`\`
  The 32 entries include four fixed users for each directory or file: owner, group, other, and mask. For a directory, the four users contain 8 ACL entries(access and default) and for a file, the four users contain 4 ACL entries(access). This means there are 24 ACL entries left for named users or groups.\\
  Based on this limitation, we can only sync up to 12 HBase granted users' ACLs. This means, if a table enables this feature, then the total users with table, namespace of this table, global READ permission should not be greater than 12.
* There are some cases that this coprocessor has not handled or could not handle, so the user HDFS ACLs are not synced normally. It will not make a reference link to another hfile of other tables.
`,r={title:"Scan Over Snapshot",description:"Using TableSnapshotScanner to scan HBase snapshots directly from HDFS, bypassing RegionServers for better performance."},h=[{href:"https://issues.apache.org/jira/browse/HBASE-8369"},{href:"https://issues.apache.org/jira/browse/HBASE-18659"},{href:"https://hadoop.apache.org/docs/r2.7.1/hadoop-project-dist/hadoop-hdfs/HdfsPermissionsGuide.html#ACLs_Access_Control_Lists"},{href:"https://issues.apache.org/jira/browse/HBASE-18659"}],o={contents:[{heading:void 0,content:`In HBase, a scan of a table costs server-side HBase resources reading, formating, and returning data back to the client.
Luckily, HBase provides a TableSnapshotScanner and TableSnapshotInputFormat (introduced by HBASE-8369),
which can scan HBase-written HFiles directly in the HDFS filesystem completely by-passing hbase. This access mode
performs better than going via HBase and can be used with an offline HBase with in-place or exported
snapshot HFiles.`},{heading:void 0,content:"To read HFiles directly, the user must have sufficient permissions to access snapshots or in-place hbase HFiles."},{heading:"tablesnapshotscanner",content:`TableSnapshotScanner provides a means for running a single client-side scan over snapshot files.
When using TableSnapshotScanner, we must specify a temporary directory to copy the snapshot files into.
The client user should have write permissions to this directory, and the dir should not be a subdirectory of
the hbase.rootdir. The scanner deletes the contents of the directory once the scanner is closed.`},{heading:"tablesnapshotinputformat",content:"TableSnapshotInputFormat provides a way to scan over snapshot HFiles in a MapReduce job."},{heading:"permission-to-access-snapshot-and-data-files",content:"Generally, only the HBase owner or the HDFS admin have the permission to access HFiles."},{heading:"permission-to-access-snapshot-and-data-files",content:"HBASE-18659 uses HDFS ACLs to make HBase granted user have permission to access snapshot files."},{heading:"hdfs-acls",content:'HDFS ACLs supports an "access ACL", which defines the rules to enforce during permission checks, and a "default ACL", which defines the ACL entries that new child files or sub-directories receive automatically during creation. Via HDFS ACLs, HBase syncs granted users with read permission to HFiles.'},{heading:"basic-idea",content:"The HBase files are organized in the following ways:"},{heading:"basic-idea",content:"{hbase-rootdir}/.tmp/data/{namespace}/{table}"},{heading:"basic-idea",content:"{hbase-rootdir}/data/{namespace}/{table}"},{heading:"basic-idea",content:"{hbase-rootdir}/archive/data/{namespace}/{table}"},{heading:"basic-idea",content:"{hbase-rootdir}/.hbase-snapshot/{snapshotName}"},{heading:"basic-idea",content:`So the basic idea is to add or remove HDFS ACLs to files of the global/namespace/table directory
when grant or revoke permission to global/namespace/table.`},{heading:"basic-idea",content:"See the design doc in HBASE-18659 for more details."},{heading:"configuration-to-use-this-feature",content:"Firstly, make sure that HDFS ACLs are enabled and umask is set to 027"},{heading:"configuration-to-use-this-feature",content:"Add master coprocessor, please make sure the SnapshotScannerHDFSAclController is configured after AccessController"},{heading:"configuration-to-use-this-feature",content:"Enable this feature"},{heading:"configuration-to-use-this-feature",content:`Modify table scheme to enable this feature for a specified table, this config is
false by default for every table, this means the HBase granted ACLs will not be synced to HDFS`},{heading:"limitation",content:"There are some limitations for this feature:"},{heading:"limitation",content:"If we enable this feature, some master operations such as grant, revoke, snapshot... (See the design doc for more details) will be slower as we need to sync HDFS ACLs to related hfiles."},{heading:"limitation",content:"HDFS has a config which limits the max ACL entries num for one directory or file:"},{heading:"limitation",content:"The 32 entries include four fixed users for each directory or file: owner, group, other, and mask. For a directory, the four users contain 8 ACL entries(access and default) and for a file, the four users contain 4 ACL entries(access). This means there are 24 ACL entries left for named users or groups.Based on this limitation, we can only sync up to 12 HBase granted users' ACLs. This means, if a table enables this feature, then the total users with table, namespace of this table, global READ permission should not be greater than 12."},{heading:"limitation",content:"There are some cases that this coprocessor has not handled or could not handle, so the user HDFS ACLs are not synced normally. It will not make a reference link to another hfile of other tables."}],headings:[{id:"tablesnapshotscanner",content:"TableSnapshotScanner"},{id:"use-tablesnapshotscanner",content:"Use TableSnapshotScanner"},{id:"tablesnapshotinputformat",content:"TableSnapshotInputFormat"},{id:"use-tablesnapshotinputformat",content:"Use TableSnapshotInputFormat"},{id:"permission-to-access-snapshot-and-data-files",content:"Permission to access snapshot and data files"},{id:"hdfs-acls",content:"HDFS ACLs"},{id:"basic-idea",content:"Basic idea"},{id:"configuration-to-use-this-feature",content:"Configuration to use this feature"},{id:"limitation",content:"Limitation"}]};const l=[{depth:2,url:"#tablesnapshotscanner",title:e.jsx(e.Fragment,{children:"TableSnapshotScanner"})},{depth:3,url:"#use-tablesnapshotscanner",title:e.jsx(e.Fragment,{children:"Use TableSnapshotScanner"})},{depth:2,url:"#tablesnapshotinputformat",title:e.jsx(e.Fragment,{children:"TableSnapshotInputFormat"})},{depth:3,url:"#use-tablesnapshotinputformat",title:e.jsx(e.Fragment,{children:"Use TableSnapshotInputFormat"})},{depth:2,url:"#permission-to-access-snapshot-and-data-files",title:e.jsx(e.Fragment,{children:"Permission to access snapshot and data files"})},{depth:3,url:"#hdfs-acls",title:e.jsx(e.Fragment,{children:"HDFS ACLs"})},{depth:3,url:"#basic-idea",title:e.jsx(e.Fragment,{children:"Basic idea"})},{depth:3,url:"#configuration-to-use-this-feature",title:e.jsx(e.Fragment,{children:"Configuration to use this feature"})},{depth:3,url:"#limitation",title:e.jsx(e.Fragment,{children:"Limitation"})}];function n(i){const s={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(s.p,{children:[`In HBase, a scan of a table costs server-side HBase resources reading, formating, and returning data back to the client.
Luckily, HBase provides a TableSnapshotScanner and TableSnapshotInputFormat (introduced by `,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-8369",children:"HBASE-8369"}),`),
which can scan HBase-written HFiles directly in the HDFS filesystem completely by-passing hbase. This access mode
performs better than going via HBase and can be used with an offline HBase with in-place or exported
snapshot HFiles.`]}),`
`,e.jsx(s.p,{children:"To read HFiles directly, the user must have sufficient permissions to access snapshots or in-place hbase HFiles."}),`
`,e.jsx(s.h2,{id:"tablesnapshotscanner",children:"TableSnapshotScanner"}),`
`,e.jsx(s.p,{children:`TableSnapshotScanner provides a means for running a single client-side scan over snapshot files.
When using TableSnapshotScanner, we must specify a temporary directory to copy the snapshot files into.
The client user should have write permissions to this directory, and the dir should not be a subdirectory of
the hbase.rootdir. The scanner deletes the contents of the directory once the scanner is closed.`}),`
`,e.jsx(s.h3,{id:"use-tablesnapshotscanner",children:"Use TableSnapshotScanner"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Path restoreDir "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"XX"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"); "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// restore dir should not be a subdirectory of hbase.rootdir"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (TableSnapshotScanner scanner "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableSnapshotScanner"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf, restoreDir, snapshotName, scan)) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Result result "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scanner."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (result "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ..."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        result "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scanner."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h2,{id:"tablesnapshotinputformat",children:"TableSnapshotInputFormat"}),`
`,e.jsx(s.p,{children:"TableSnapshotInputFormat provides a way to scan over snapshot HFiles in a MapReduce job."}),`
`,e.jsx(s.h3,{id:"use-tablesnapshotinputformat",children:"Use TableSnapshotInputFormat"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Job job "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Job"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Path restoreDir "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"XX"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"); "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// restore dir should not be a subdirectory of hbase.rootdir"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableSnapshotMapperJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(snapshotName, scan, MyTableMapper.class, MyMapKeyOutput.class, MyMapOutputValueWritable.class, job, "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", restoreDir);"})]})]})})}),`
`,e.jsx(s.h2,{id:"permission-to-access-snapshot-and-data-files",children:"Permission to access snapshot and data files"}),`
`,e.jsx(s.p,{children:"Generally, only the HBase owner or the HDFS admin have the permission to access HFiles."}),`
`,e.jsxs(s.p,{children:[e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-18659",children:"HBASE-18659"})," uses HDFS ACLs to make HBase granted user have permission to access snapshot files."]}),`
`,e.jsx(s.h3,{id:"hdfs-acls",children:"HDFS ACLs"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.a,{href:"https://hadoop.apache.org/docs/r2.7.1/hadoop-project-dist/hadoop-hdfs/HdfsPermissionsGuide.html#ACLs_Access_Control_Lists",children:"HDFS ACLs"}),' supports an "access ACL", which defines the rules to enforce during permission checks, and a "default ACL", which defines the ACL entries that new child files or sub-directories receive automatically during creation. Via HDFS ACLs, HBase syncs granted users with read permission to HFiles.']}),`
`,e.jsx(s.h3,{id:"basic-idea",children:"Basic idea"}),`
`,e.jsx(s.p,{children:"The HBase files are organized in the following ways:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"{hbase-rootdir}/.tmp/data/{namespace}/{table}"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"{hbase-rootdir}/data/{namespace}/{table}"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"{hbase-rootdir}/archive/data/{namespace}/{table}"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"{hbase-rootdir}/.hbase-snapshot/{snapshotName}"})}),`
`]}),`
`,e.jsx(s.p,{children:`So the basic idea is to add or remove HDFS ACLs to files of the global/namespace/table directory
when grant or revoke permission to global/namespace/table.`}),`
`,e.jsxs(s.p,{children:["See the design doc in ",e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-18659",children:"HBASE-18659"})," for more details."]}),`
`,e.jsx(s.h3,{id:"configuration-to-use-this-feature",children:"Configuration to use this feature"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Firstly, make sure that HDFS ACLs are enabled and umask is set to 027"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"dfs.namenode.acls.enabled = true"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"fs.permissions.umask-mode = 027"})})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Add master coprocessor, please make sure the SnapshotScannerHDFSAclController is configured after AccessController"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'hbase.coprocessor.master.classes = "org.apache.hadoop.hbase.security.access.AccessController'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:',org.apache.hadoop.hbase.security.access.SnapshotScannerHDFSAclController"'})})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Enable this feature"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"hbase.acl.sync.to.hdfs.enable=true"})})})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:`Modify table scheme to enable this feature for a specified table, this config is
false by default for every table, this means the HBase granted ACLs will not be synced to HDFS`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"alter "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"CONFIGURATION"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase.acl.sync.to.hdfs.enable'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'true'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]})})})}),`
`]}),`
`]}),`
`,e.jsx(s.h3,{id:"limitation",children:"Limitation"}),`
`,e.jsx(s.p,{children:"There are some limitations for this feature:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"If we enable this feature, some master operations such as grant, revoke, snapshot... (See the design doc for more details) will be slower as we need to sync HDFS ACLs to related hfiles."}),`
`,e.jsxs(s.li,{children:["HDFS has a config which limits the max ACL entries num for one directory or file:",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"dfs.namenode.acls.max.entries = 32(default value)"})})})})}),`
`,"The 32 entries include four fixed users for each directory or file: owner, group, other, and mask. For a directory, the four users contain 8 ACL entries(access and default) and for a file, the four users contain 4 ACL entries(access). This means there are 24 ACL entries left for named users or groups.",e.jsx(s.br,{}),`
`,"Based on this limitation, we can only sync up to 12 HBase granted users' ACLs. This means, if a table enables this feature, then the total users with table, namespace of this table, global READ permission should not be greater than 12."]}),`
`,e.jsx(s.li,{children:"There are some cases that this coprocessor has not handled or could not handle, so the user HDFS ACLs are not synced normally. It will not make a reference link to another hfile of other tables."}),`
`]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{t as _markdown,c as default,h as extractedReferences,r as frontmatter,o as structuredData,l as toc};
