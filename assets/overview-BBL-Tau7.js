import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as t,a as r,b as l}from"./backup-cloud-appliance--qbLnXgy.js";let d=`





Backup and restore is a standard operation provided by many databases. An effective backup and restore
strategy helps ensure that users can recover data in case of unexpected failures. The HBase backup and restore
feature helps ensure that enterprises using HBase as a canonical data repository can recover from catastrophic
failures. Another important feature is the ability to restore the database to a particular
point-in-time, commonly referred to as a snapshot.

The HBase backup and restore feature provides the ability to create full backups and incremental backups on
tables in an HBase cluster. The full backup is the foundation on which incremental backups are applied
to build iterative snapshots. Incremental backups can be run on a schedule to capture changes over time,
for example by using a Cron task. Incremental backups are more cost-effective than full backups because they only capture
the changes since the last backup and they also enable administrators to restore the database to any prior incremental backup. Furthermore, the
utilities also enable table-level data backup-and-recovery if you do not want to restore the entire dataset
of the backup.

The backup and restore feature supplements the HBase Replication feature. While HBase replication is ideal for
creating "hot" copies of the data (where the replicated data is immediately available for query), the backup and
restore feature is ideal for creating "cold" copies of data (where a manual step must be taken to restore the system).
Previously, users only had the ability to create full backups via the ExportSnapshot functionality. The incremental
backup implementation is the novel improvement over the previous "art" provided by ExportSnapshot.

The backup and restore feature uses DistCp to transfer files between clusters .
[HADOOP-15850](https://issues.apache.org/jira/browse/HADOOP-15850) fixes a bug where CopyCommitter#concatFileChunks
unconditionally tried to concatenate the files being DistCp'ed to target cluster (though the files are
independent) . Without the fix from
[HADOOP-15850](https://issues.apache.org/jira/browse/HADOOP-15850) , the transfer would fail.
So the backup and restore feature need hadoop version as below

* 2.7.x
* 2.8.x
* 2.9.2+
* 2.10.0+
* 3.0.4+
* 3.1.2+
* 3.2.0+
* 3.3.0+

## Terminology

The backup and restore feature introduces new terminology which can be used to understand how control flows through the
system.

* *A backup*: A logical unit of data and metadata which can restore a table to its state at a specific point in time.
* *Full backup*: a type of backup which wholly encapsulates the contents of the table at a point in time.
* *Incremental backup*: a type of backup which contains the changes in a table since a full backup.
* *Backup set*: A user-defined name which references one or more tables over which a backup can be executed.
* *Backup ID*: A unique names which identifies one backup from the rest, e.g. \`backupId_1467823988425\`

## Planning

There are some common strategies which can be used to implement backup and restore in your environment. The following section
shows how these strategies are implemented and identifies potential tradeoffs with each.

<Callout type="warn">
  This backup and restore tools has not been tested on Transparent Data Encryption (TDE) enabled
  HDFS clusters. This is related to the open issue
  [HBASE-16178](https://issues.apache.org/jira/browse/HBASE-16178).
</Callout>

### Backup within a cluster

This strategy stores the backups on the same cluster as where the backup was taken. This approach is only appropriate for testing
as it does not provide any additional safety on top of what the software itself already provides.

<img alt="Intra-Cluster Backup" src={__img0} placeholder="blur" />

### Backup using a dedicated cluster

This strategy provides greater fault tolerance and provides a path towards disaster recovery. In this setting, you will
store the backup on a separate HDFS cluster by supplying the backup destination cluster's HDFS URL to the backup utility.
You should consider backing up to a different physical location, such as a different data center.

Typically, a backup-dedicated HDFS cluster uses a more economical hardware profile to save money.

<img alt="Dedicated HDFS Cluster Backup" src={__img1} placeholder="blur" />

### Backup to the Cloud or a storage vendor appliance

Another approach to safeguarding HBase incremental backups is to store the data on provisioned, secure servers that belong
to third-party vendors and that are located off-site. The vendor can be a public cloud provider or a storage vendor who uses
a Hadoop-compatible file system, such as S3 and other HDFS-compatible destinations.

<img alt="Backup to Cloud or Vendor Storage Solutions" src={__img2} placeholder="blur" />

<Callout type="info">
  The HBase backup utility does not support backup to multiple destinations. A workaround is to
  manually create copies of the backup files from HDFS or S3.
</Callout>

## First-time configuration steps

This section contains the necessary configuration changes that must be made in order to use the backup and restore feature.
As this feature makes significant use of YARN's MapReduce framework to parallelize these I/O heavy operations, configuration
changes extend outside of just \`hbase-site.xml\`.

### Allow the "hbase" system user in YARN

The YARN *container-executor.cfg* configuration file must have the following property setting: *allowed.system.users=hbase*. No spaces
are allowed in entries of this configuration file.

<Callout type="warn">
  Skipping this step will result in runtime errors when executing the first backup tasks.
</Callout>

**Example of a valid container-executor.cfg file for backup and restore:**

\`\`\`text
yarn.nodemanager.log-dirs=/var/log/hadoop/mapred
yarn.nodemanager.linux-container-executor.group=yarn
banned.users=hdfs,yarn,mapred,bin
allowed.system.users=hbase
min.user.id=500
\`\`\`

### HBase specific changes

Add the following properties to hbase-site.xml and restart HBase if it is already running.

<Callout type="info">
  The ",..." is an ellipsis meant to imply that this is a comma-separated list of values, not
  literal text which should be added to hbase-site.xml.
</Callout>

\`\`\`xml
<property>
  <name>hbase.backup.enable</name>
  <value>true</value>
</property>
<property>
  <name>hbase.master.logcleaner.plugins</name>
  <value>org.apache.hadoop.hbase.backup.master.BackupLogCleaner,...</value>
</property>
<property>
  <name>hbase.procedure.master.classes</name>
  <value>org.apache.hadoop.hbase.backup.master.LogRollMasterProcedureManager,...</value>
</property>
<property>
  <name>hbase.procedure.regionserver.classes</name>
  <value>org.apache.hadoop.hbase.backup.regionserver.LogRollRegionServerProcedureManager,...</value>
</property>
<property>
  <name>hbase.coprocessor.region.classes</name>
  <value>org.apache.hadoop.hbase.backup.BackupObserver,...</value>
</property>
<property>
  <name>hbase.coprocessor.master.classes</name>
  <value>org.apache.hadoop.hbase.backup.BackupMasterObserver,...</value>
</property>
<property>
  <name>hbase.master.hfilecleaner.plugins</name>
  <value>org.apache.hadoop.hbase.backup.BackupHFileCleaner,...</value>
</property>
\`\`\`
`,p={title:"Overview",description:"Introduction to HBase backup and restore feature, including full and incremental backups for disaster recovery and point-in-time recovery."},u=[{href:"https://issues.apache.org/jira/browse/HADOOP-15850"},{href:"https://issues.apache.org/jira/browse/HADOOP-15850"},{href:"https://issues.apache.org/jira/browse/HBASE-16178"}],k={contents:[{heading:void 0,content:`Backup and restore is a standard operation provided by many databases. An effective backup and restore
strategy helps ensure that users can recover data in case of unexpected failures. The HBase backup and restore
feature helps ensure that enterprises using HBase as a canonical data repository can recover from catastrophic
failures. Another important feature is the ability to restore the database to a particular
point-in-time, commonly referred to as a snapshot.`},{heading:void 0,content:`The HBase backup and restore feature provides the ability to create full backups and incremental backups on
tables in an HBase cluster. The full backup is the foundation on which incremental backups are applied
to build iterative snapshots. Incremental backups can be run on a schedule to capture changes over time,
for example by using a Cron task. Incremental backups are more cost-effective than full backups because they only capture
the changes since the last backup and they also enable administrators to restore the database to any prior incremental backup. Furthermore, the
utilities also enable table-level data backup-and-recovery if you do not want to restore the entire dataset
of the backup.`},{heading:void 0,content:`The backup and restore feature supplements the HBase Replication feature. While HBase replication is ideal for
creating "hot" copies of the data (where the replicated data is immediately available for query), the backup and
restore feature is ideal for creating "cold" copies of data (where a manual step must be taken to restore the system).
Previously, users only had the ability to create full backups via the ExportSnapshot functionality. The incremental
backup implementation is the novel improvement over the previous "art" provided by ExportSnapshot.`},{heading:void 0,content:`The backup and restore feature uses DistCp to transfer files between clusters .
HADOOP-15850 fixes a bug where CopyCommitter#concatFileChunks
unconditionally tried to concatenate the files being DistCp'ed to target cluster (though the files are
independent) . Without the fix from
HADOOP-15850 , the transfer would fail.
So the backup and restore feature need hadoop version as below`},{heading:void 0,content:"2.7.x"},{heading:void 0,content:"2.8.x"},{heading:void 0,content:"2.9.2+"},{heading:void 0,content:"2.10.0+"},{heading:void 0,content:"3.0.4+"},{heading:void 0,content:"3.1.2+"},{heading:void 0,content:"3.2.0+"},{heading:void 0,content:"3.3.0+"},{heading:"terminology",content:`The backup and restore feature introduces new terminology which can be used to understand how control flows through the
system.`},{heading:"terminology",content:"A backup: A logical unit of data and metadata which can restore a table to its state at a specific point in time."},{heading:"terminology",content:"Full backup: a type of backup which wholly encapsulates the contents of the table at a point in time."},{heading:"terminology",content:"Incremental backup: a type of backup which contains the changes in a table since a full backup."},{heading:"terminology",content:"Backup set: A user-defined name which references one or more tables over which a backup can be executed."},{heading:"terminology",content:"Backup ID: A unique names which identifies one backup from the rest, e.g. backupId_1467823988425"},{heading:"planning",content:`There are some common strategies which can be used to implement backup and restore in your environment. The following section
shows how these strategies are implemented and identifies potential tradeoffs with each.`},{heading:"planning",content:"type: warn"},{heading:"planning",content:`This backup and restore tools has not been tested on Transparent Data Encryption (TDE) enabled
HDFS clusters. This is related to the open issue
HBASE-16178.`},{heading:"backup-within-a-cluster",content:`This strategy stores the backups on the same cluster as where the backup was taken. This approach is only appropriate for testing
as it does not provide any additional safety on top of what the software itself already provides.`},{heading:"backup-using-a-dedicated-cluster",content:`This strategy provides greater fault tolerance and provides a path towards disaster recovery. In this setting, you will
store the backup on a separate HDFS cluster by supplying the backup destination cluster's HDFS URL to the backup utility.
You should consider backing up to a different physical location, such as a different data center.`},{heading:"backup-using-a-dedicated-cluster",content:"Typically, a backup-dedicated HDFS cluster uses a more economical hardware profile to save money."},{heading:"backup-to-the-cloud-or-a-storage-vendor-appliance",content:`Another approach to safeguarding HBase incremental backups is to store the data on provisioned, secure servers that belong
to third-party vendors and that are located off-site. The vendor can be a public cloud provider or a storage vendor who uses
a Hadoop-compatible file system, such as S3 and other HDFS-compatible destinations.`},{heading:"backup-to-the-cloud-or-a-storage-vendor-appliance",content:"type: info"},{heading:"backup-to-the-cloud-or-a-storage-vendor-appliance",content:`The HBase backup utility does not support backup to multiple destinations. A workaround is to
manually create copies of the backup files from HDFS or S3.`},{heading:"first-time-configuration-steps",content:`This section contains the necessary configuration changes that must be made in order to use the backup and restore feature.
As this feature makes significant use of YARN's MapReduce framework to parallelize these I/O heavy operations, configuration
changes extend outside of just hbase-site.xml.`},{heading:"allow-the-hbase-system-user-in-yarn",content:`The YARN container-executor.cfg configuration file must have the following property setting: allowed.system.users=hbase. No spaces
are allowed in entries of this configuration file.`},{heading:"allow-the-hbase-system-user-in-yarn",content:"type: warn"},{heading:"allow-the-hbase-system-user-in-yarn",content:"Skipping this step will result in runtime errors when executing the first backup tasks."},{heading:"allow-the-hbase-system-user-in-yarn",content:"Example of a valid container-executor.cfg file for backup and restore:"},{heading:"hbase-specific-changes",content:"Add the following properties to hbase-site.xml and restart HBase if it is already running."},{heading:"hbase-specific-changes",content:"type: info"},{heading:"hbase-specific-changes",content:`The ",..." is an ellipsis meant to imply that this is a comma-separated list of values, not
literal text which should be added to hbase-site.xml.`}],headings:[{id:"terminology",content:"Terminology"},{id:"planning",content:"Planning"},{id:"backup-within-a-cluster",content:"Backup within a cluster"},{id:"backup-using-a-dedicated-cluster",content:"Backup using a dedicated cluster"},{id:"backup-to-the-cloud-or-a-storage-vendor-appliance",content:"Backup to the Cloud or a storage vendor appliance"},{id:"first-time-configuration-steps",content:"First-time configuration steps"},{id:"allow-the-hbase-system-user-in-yarn",content:'Allow the "hbase" system user in YARN'},{id:"hbase-specific-changes",content:"HBase specific changes"}]};const g=[{depth:2,url:"#terminology",title:e.jsx(e.Fragment,{children:"Terminology"})},{depth:2,url:"#planning",title:e.jsx(e.Fragment,{children:"Planning"})},{depth:3,url:"#backup-within-a-cluster",title:e.jsx(e.Fragment,{children:"Backup within a cluster"})},{depth:3,url:"#backup-using-a-dedicated-cluster",title:e.jsx(e.Fragment,{children:"Backup using a dedicated cluster"})},{depth:3,url:"#backup-to-the-cloud-or-a-storage-vendor-appliance",title:e.jsx(e.Fragment,{children:"Backup to the Cloud or a storage vendor appliance"})},{depth:2,url:"#first-time-configuration-steps",title:e.jsx(e.Fragment,{children:"First-time configuration steps"})},{depth:3,url:"#allow-the-hbase-system-user-in-yarn",title:e.jsx(e.Fragment,{children:'Allow the "hbase" system user in YARN'})},{depth:3,url:"#hbase-specific-changes",title:e.jsx(e.Fragment,{children:"HBase specific changes"})}];function n(a){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:i}=s;return i||h("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.p,{children:`Backup and restore is a standard operation provided by many databases. An effective backup and restore
strategy helps ensure that users can recover data in case of unexpected failures. The HBase backup and restore
feature helps ensure that enterprises using HBase as a canonical data repository can recover from catastrophic
failures. Another important feature is the ability to restore the database to a particular
point-in-time, commonly referred to as a snapshot.`}),`
`,e.jsx(s.p,{children:`The HBase backup and restore feature provides the ability to create full backups and incremental backups on
tables in an HBase cluster. The full backup is the foundation on which incremental backups are applied
to build iterative snapshots. Incremental backups can be run on a schedule to capture changes over time,
for example by using a Cron task. Incremental backups are more cost-effective than full backups because they only capture
the changes since the last backup and they also enable administrators to restore the database to any prior incremental backup. Furthermore, the
utilities also enable table-level data backup-and-recovery if you do not want to restore the entire dataset
of the backup.`}),`
`,e.jsx(s.p,{children:`The backup and restore feature supplements the HBase Replication feature. While HBase replication is ideal for
creating "hot" copies of the data (where the replicated data is immediately available for query), the backup and
restore feature is ideal for creating "cold" copies of data (where a manual step must be taken to restore the system).
Previously, users only had the ability to create full backups via the ExportSnapshot functionality. The incremental
backup implementation is the novel improvement over the previous "art" provided by ExportSnapshot.`}),`
`,e.jsxs(s.p,{children:[`The backup and restore feature uses DistCp to transfer files between clusters .
`,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HADOOP-15850",children:"HADOOP-15850"}),` fixes a bug where CopyCommitter#concatFileChunks
unconditionally tried to concatenate the files being DistCp'ed to target cluster (though the files are
independent) . Without the fix from
`,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HADOOP-15850",children:"HADOOP-15850"}),` , the transfer would fail.
So the backup and restore feature need hadoop version as below`]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"2.7.x"}),`
`,e.jsx(s.li,{children:"2.8.x"}),`
`,e.jsx(s.li,{children:"2.9.2+"}),`
`,e.jsx(s.li,{children:"2.10.0+"}),`
`,e.jsx(s.li,{children:"3.0.4+"}),`
`,e.jsx(s.li,{children:"3.1.2+"}),`
`,e.jsx(s.li,{children:"3.2.0+"}),`
`,e.jsx(s.li,{children:"3.3.0+"}),`
`]}),`
`,e.jsx(s.h2,{id:"terminology",children:"Terminology"}),`
`,e.jsx(s.p,{children:`The backup and restore feature introduces new terminology which can be used to understand how control flows through the
system.`}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.em,{children:"A backup"}),": A logical unit of data and metadata which can restore a table to its state at a specific point in time."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.em,{children:"Full backup"}),": a type of backup which wholly encapsulates the contents of the table at a point in time."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.em,{children:"Incremental backup"}),": a type of backup which contains the changes in a table since a full backup."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.em,{children:"Backup set"}),": A user-defined name which references one or more tables over which a backup can be executed."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.em,{children:"Backup ID"}),": A unique names which identifies one backup from the rest, e.g. ",e.jsx(s.code,{children:"backupId_1467823988425"})]}),`
`]}),`
`,e.jsx(s.h2,{id:"planning",children:"Planning"}),`
`,e.jsx(s.p,{children:`There are some common strategies which can be used to implement backup and restore in your environment. The following section
shows how these strategies are implemented and identifies potential tradeoffs with each.`}),`
`,e.jsx(i,{type:"warn",children:e.jsxs(s.p,{children:[`This backup and restore tools has not been tested on Transparent Data Encryption (TDE) enabled
HDFS clusters. This is related to the open issue
`,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-16178",children:"HBASE-16178"}),"."]})}),`
`,e.jsx(s.h3,{id:"backup-within-a-cluster",children:"Backup within a cluster"}),`
`,e.jsx(s.p,{children:`This strategy stores the backups on the same cluster as where the backup was taken. This approach is only appropriate for testing
as it does not provide any additional safety on top of what the software itself already provides.`}),`
`,e.jsx(s.p,{children:e.jsx(s.img,{alt:"Intra-Cluster Backup",src:t,placeholder:"blur"})}),`
`,e.jsx(s.h3,{id:"backup-using-a-dedicated-cluster",children:"Backup using a dedicated cluster"}),`
`,e.jsx(s.p,{children:`This strategy provides greater fault tolerance and provides a path towards disaster recovery. In this setting, you will
store the backup on a separate HDFS cluster by supplying the backup destination cluster's HDFS URL to the backup utility.
You should consider backing up to a different physical location, such as a different data center.`}),`
`,e.jsx(s.p,{children:"Typically, a backup-dedicated HDFS cluster uses a more economical hardware profile to save money."}),`
`,e.jsx(s.p,{children:e.jsx(s.img,{alt:"Dedicated HDFS Cluster Backup",src:r,placeholder:"blur"})}),`
`,e.jsx(s.h3,{id:"backup-to-the-cloud-or-a-storage-vendor-appliance",children:"Backup to the Cloud or a storage vendor appliance"}),`
`,e.jsx(s.p,{children:`Another approach to safeguarding HBase incremental backups is to store the data on provisioned, secure servers that belong
to third-party vendors and that are located off-site. The vendor can be a public cloud provider or a storage vendor who uses
a Hadoop-compatible file system, such as S3 and other HDFS-compatible destinations.`}),`
`,e.jsx(s.p,{children:e.jsx(s.img,{alt:"Backup to Cloud or Vendor Storage Solutions",src:l,placeholder:"blur"})}),`
`,e.jsx(i,{type:"info",children:e.jsx(s.p,{children:`The HBase backup utility does not support backup to multiple destinations. A workaround is to
manually create copies of the backup files from HDFS or S3.`})}),`
`,e.jsx(s.h2,{id:"first-time-configuration-steps",children:"First-time configuration steps"}),`
`,e.jsxs(s.p,{children:[`This section contains the necessary configuration changes that must be made in order to use the backup and restore feature.
As this feature makes significant use of YARN's MapReduce framework to parallelize these I/O heavy operations, configuration
changes extend outside of just `,e.jsx(s.code,{children:"hbase-site.xml"}),"."]}),`
`,e.jsx(s.h3,{id:"allow-the-hbase-system-user-in-yarn",children:'Allow the "hbase" system user in YARN'}),`
`,e.jsxs(s.p,{children:["The YARN ",e.jsx(s.em,{children:"container-executor.cfg"})," configuration file must have the following property setting: ",e.jsx(s.em,{children:"allowed.system.users=hbase"}),`. No spaces
are allowed in entries of this configuration file.`]}),`
`,e.jsx(i,{type:"warn",children:e.jsx(s.p,{children:"Skipping this step will result in runtime errors when executing the first backup tasks."})}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Example of a valid container-executor.cfg file for backup and restore:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"yarn.nodemanager.log-dirs=/var/log/hadoop/mapred"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"yarn.nodemanager.linux-container-executor.group=yarn"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"banned.users=hdfs,yarn,mapred,bin"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"allowed.system.users=hbase"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"min.user.id=500"})})]})})}),`
`,e.jsx(s.h3,{id:"hbase-specific-changes",children:"HBase specific changes"}),`
`,e.jsx(s.p,{children:"Add the following properties to hbase-site.xml and restart HBase if it is already running."}),`
`,e.jsx(i,{type:"info",children:e.jsx(s.p,{children:`The ",..." is an ellipsis meant to imply that this is a comma-separated list of values, not
literal text which should be added to hbase-site.xml.`})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.backup.enable</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">true</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.master.logcleaner.plugins</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.master.BackupLogCleaner,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.procedure.master.classes</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.master.LogRollMasterProcedureManager,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.procedure.regionserver.classes</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.regionserver.LogRollRegionServerProcedureManager,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.region.classes</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.BackupObserver,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.master.classes</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.BackupMasterObserver,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.master.hfilecleaner.plugins</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.backup.BackupHFileCleaner,...</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})})]})}function m(a={}){const{wrapper:s}=a.components||{};return s?e.jsx(s,{...a,children:e.jsx(n,{...a})}):n(a)}function h(a,s){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,m as default,u as extractedReferences,p as frontmatter,k as structuredData,g as toc};
