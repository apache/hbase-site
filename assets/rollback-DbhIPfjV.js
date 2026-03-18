import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`Sometimes things don't go as planned when attempting an upgrade. This section explains how to perform a *rollback* to an earlier HBase release. Note that this should only be needed between Major and some Minor releases. You should always be able to *downgrade* between HBase Patch releases within the same Minor version. These instructions may require you to take steps before you start the upgrade process, so be sure to read through this section beforehand.

## Caveats

### Rollback vs Downgrade

This section describes how to perform a *rollback* on an upgrade between HBase minor and major versions. In this document, rollback refers to the process of taking an upgraded cluster and restoring it to the old version *while losing all changes that have occurred since upgrade*. By contrast, a cluster *downgrade* would restore an upgraded cluster to the old version while maintaining any data written since the upgrade. We currently only offer instructions to rollback HBase clusters. Further, rollback only works when these instructions are followed prior to performing the upgrade.

When these instructions talk about rollback vs downgrade of prerequisite cluster services (i.e. HDFS), you should treat leaving the service version the same as a degenerate case of downgrade.

### Replication

Unless you are doing an all-service rollback, the HBase cluster will lose any configured peers for HBase replication. If your cluster is configured for HBase replication, then prior to following these instructions you should document all replication peers. After performing the rollback you should then add each documented peer back to the cluster. Note also that data written to the cluster since the upgrade may or may not have already been replicated to any peers. Determining which, if any, peers have seen replication data as well as rolling back the data in those peers is out of the scope of this guide.

### Data Locality

Unless you are doing an all-service rollback, going through a rollback procedure will likely destroy all locality for Region Servers. You should expect degraded performance until after the cluster has had time to go through compactions to restore data locality. Optionally, you can force a compaction to speed this process up at the cost of generating cluster load.

### Configurable Locations

The instructions below assume default locations for the HBase data directory and the HBase znode. Both of these locations are configurable and you should verify the value used in your cluster before proceeding. In the event that you have a different value, just replace the default with the one found in your configuration \\* HBase data directory is configured via the key 'hbase.rootdir' and has a default value of '/hbase'. \\* HBase znode is configured via the key 'zookeeper.znode.parent' and has a default value of '/hbase'.

## All service rollback

If you will be performing a rollback of both the HDFS and ZooKeeper services, then HBase's data will be rolled back in the process.

### Requirements

* Ability to rollback HDFS and ZooKeeper

### Before upgrade

No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance.

### Performing a rollback

<Steps>
  <Step>
    Stop HBase
  </Step>

  <Step>
    Perform a rollback for HDFS and ZooKeeper (HBase should remain stopped)
  </Step>

  <Step>
    Change the installed version of HBase to the previous version
  </Step>

  <Step>
    Start HBase
  </Step>

  <Step>
    Verify HBase contents — use the HBase shell to list tables and scan some known values.
  </Step>
</Steps>

## Rollback after HDFS rollback and ZooKeeper downgrade

If you will be rolling back HDFS but going through a ZooKeeper downgrade, then HBase will be in an inconsistent state. You must ensure the cluster is not started until you complete this process.

### Requirements

* Ability to rollback HDFS
* Ability to downgrade ZooKeeper

### Before upgrade

No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance.

### Performing a rollback

<Steps>
  <Step>
    Stop HBase
  </Step>

  <Step>
    Perform a rollback for HDFS and a downgrade for ZooKeeper (HBase should remain stopped)
  </Step>

  <Step>
    Change the installed version of HBase to the previous version
  </Step>

  <Step>
    Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information.

    **Clean HBase information out of ZooKeeper:**

    \`\`\`bash
    [hpnewton@gateway_node.example.com ~]$ zookeeper-client -server zookeeper1.example.com:2181,zookeeper2.example.com:2181,zookeeper3.example.com:2181
    Welcome to ZooKeeper!
    JLine support is disabled
    rmr /hbase
    quit
    Quitting...
    \`\`\`
  </Step>

  <Step>
    Start HBase
  </Step>

  <Step>
    Verify HBase contents—use the HBase shell to list tables and scan some known values.
  </Step>
</Steps>

## Rollback after HDFS downgrade

If you will be performing an HDFS downgrade, then you'll need to follow these instructions regardless of whether ZooKeeper goes through rollback, downgrade, or reinstallation.

### Requirements

* Ability to downgrade HDFS
* Pre-upgrade cluster must be able to run MapReduce jobs
* HDFS super user access
* Sufficient space in HDFS for at least two copies of the HBase data directory

### Before upgrade

Before beginning the upgrade process, you must take a complete backup of HBase's backing data. The following instructions cover backing up the data within the current HDFS instance. Alternatively, you can use the distcp command to copy the data to another HDFS cluster.

<Steps>
  <Step>
    Stop the HBase cluster
  </Step>

  <Step>
    Copy the HBase data directory to a backup location using the [distcp command](https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html) as the HDFS super user (shown below on a security enabled cluster)

    **Using distcp to backup the HBase data directory:**

    \`\`\`bash
    [hpnewton@gateway_node.example.com ~]$ kinit -k -t hdfs.keytab hdfs@EXAMPLE.COM
    [hpnewton@gateway_node.example.com ~]$ hadoop distcp /hbase /hbase-pre-upgrade-backup
    \`\`\`
  </Step>

  <Step>
    Distcp will launch a mapreduce job to handle copying the files in a distributed fashion. Check the output of the distcp command to ensure this job completed successfully.
  </Step>
</Steps>

### Performing a rollback

<Steps>
  <Step>
    Stop HBase
  </Step>

  <Step>
    Perform a downgrade for HDFS and a downgrade/rollback for ZooKeeper (HBase should remain stopped)
  </Step>

  <Step>
    Change the installed version of HBase to the previous version
  </Step>

  <Step>
    Restore the HBase data directory from prior to the upgrade. Restore the HBase data directory from prior to the upgrade as the HDFS super user (shown below on a security enabled cluster). If you backed up your data on another HDFS cluster instead of locally, you will need to use the distcp command to copy it back to the current HDFS cluster.

    **Restore the HBase data directory:**

    \`\`\`bash
    [hpnewton@gateway_node.example.com ~]$ kinit -k -t hdfs.keytab hdfs@EXAMPLE.COM
    [hpnewton@gateway_node.example.com ~]$ hdfs dfs -mv /hbase /hbase-upgrade-rollback
    [hpnewton@gateway_node.example.com ~]$ hdfs dfs -mv /hbase-pre-upgrade-backup /hbase
    \`\`\`
  </Step>

  <Step>
    Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information.

    **Clean HBase information out of ZooKeeper:**

    \`\`\`bash
    [hpnewton@gateway_node.example.com ~]$ zookeeper-client -server zookeeper1.example.com:2181,zookeeper2.example.com:2181,zookeeper3.example.com:2181
    Welcome to ZooKeeper!
    JLine support is disabled
    rmr /hbase
    quit
    Quitting...
    \`\`\`
  </Step>

  <Step>
    Start HBase
  </Step>

  <Step>
    Verify HBase contents–use the HBase shell to list tables and scan some known values.
  </Step>
</Steps>
`,d={title:"Rollback",description:"How to rollback an HBase upgrade to restore the cluster to a previous version, including backup procedures and data recovery steps."},c=[{href:"https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html"}],h={contents:[{heading:void 0,content:"Sometimes things don't go as planned when attempting an upgrade. This section explains how to perform a rollback to an earlier HBase release. Note that this should only be needed between Major and some Minor releases. You should always be able to downgrade between HBase Patch releases within the same Minor version. These instructions may require you to take steps before you start the upgrade process, so be sure to read through this section beforehand."},{heading:"rollback-vs-downgrade",content:"This section describes how to perform a rollback on an upgrade between HBase minor and major versions. In this document, rollback refers to the process of taking an upgraded cluster and restoring it to the old version while losing all changes that have occurred since upgrade. By contrast, a cluster downgrade would restore an upgraded cluster to the old version while maintaining any data written since the upgrade. We currently only offer instructions to rollback HBase clusters. Further, rollback only works when these instructions are followed prior to performing the upgrade."},{heading:"rollback-vs-downgrade",content:"When these instructions talk about rollback vs downgrade of prerequisite cluster services (i.e. HDFS), you should treat leaving the service version the same as a degenerate case of downgrade."},{heading:"replication",content:"Unless you are doing an all-service rollback, the HBase cluster will lose any configured peers for HBase replication. If your cluster is configured for HBase replication, then prior to following these instructions you should document all replication peers. After performing the rollback you should then add each documented peer back to the cluster. Note also that data written to the cluster since the upgrade may or may not have already been replicated to any peers. Determining which, if any, peers have seen replication data as well as rolling back the data in those peers is out of the scope of this guide."},{heading:"data-locality",content:"Unless you are doing an all-service rollback, going through a rollback procedure will likely destroy all locality for Region Servers. You should expect degraded performance until after the cluster has had time to go through compactions to restore data locality. Optionally, you can force a compaction to speed this process up at the cost of generating cluster load."},{heading:"configurable-locations",content:"The instructions below assume default locations for the HBase data directory and the HBase znode. Both of these locations are configurable and you should verify the value used in your cluster before proceeding. In the event that you have a different value, just replace the default with the one found in your configuration * HBase data directory is configured via the key 'hbase.rootdir' and has a default value of '/hbase'. * HBase znode is configured via the key 'zookeeper.znode.parent' and has a default value of '/hbase'."},{heading:"all-service-rollback",content:"If you will be performing a rollback of both the HDFS and ZooKeeper services, then HBase's data will be rolled back in the process."},{heading:"requirements",content:"Ability to rollback HDFS and ZooKeeper"},{heading:"before-upgrade",content:"No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance."},{heading:"performing-a-rollback",content:"Stop HBase"},{heading:"performing-a-rollback",content:"Perform a rollback for HDFS and ZooKeeper (HBase should remain stopped)"},{heading:"performing-a-rollback",content:"Change the installed version of HBase to the previous version"},{heading:"performing-a-rollback",content:"Start HBase"},{heading:"performing-a-rollback",content:"Verify HBase contents — use the HBase shell to list tables and scan some known values."},{heading:"rollback-after-hdfs-rollback-and-zookeeper-downgrade",content:"If you will be rolling back HDFS but going through a ZooKeeper downgrade, then HBase will be in an inconsistent state. You must ensure the cluster is not started until you complete this process."},{heading:"requirements-1",content:"Ability to rollback HDFS"},{heading:"requirements-1",content:"Ability to downgrade ZooKeeper"},{heading:"before-upgrade-1",content:"No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance."},{heading:"performing-a-rollback-1",content:"Stop HBase"},{heading:"performing-a-rollback-1",content:"Perform a rollback for HDFS and a downgrade for ZooKeeper (HBase should remain stopped)"},{heading:"performing-a-rollback-1",content:"Change the installed version of HBase to the previous version"},{heading:"performing-a-rollback-1",content:"Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information."},{heading:"performing-a-rollback-1",content:"Clean HBase information out of ZooKeeper:"},{heading:"performing-a-rollback-1",content:"Start HBase"},{heading:"performing-a-rollback-1",content:"Verify HBase contents—use the HBase shell to list tables and scan some known values."},{heading:"rollback-after-hdfs-downgrade",content:"If you will be performing an HDFS downgrade, then you'll need to follow these instructions regardless of whether ZooKeeper goes through rollback, downgrade, or reinstallation."},{heading:"requirements-2",content:"Ability to downgrade HDFS"},{heading:"requirements-2",content:"Pre-upgrade cluster must be able to run MapReduce jobs"},{heading:"requirements-2",content:"HDFS super user access"},{heading:"requirements-2",content:"Sufficient space in HDFS for at least two copies of the HBase data directory"},{heading:"before-upgrade-2",content:"Before beginning the upgrade process, you must take a complete backup of HBase's backing data. The following instructions cover backing up the data within the current HDFS instance. Alternatively, you can use the distcp command to copy the data to another HDFS cluster."},{heading:"before-upgrade-2",content:"Stop the HBase cluster"},{heading:"before-upgrade-2",content:"Copy the HBase data directory to a backup location using the distcp command as the HDFS super user (shown below on a security enabled cluster)"},{heading:"before-upgrade-2",content:"Using distcp to backup the HBase data directory:"},{heading:"before-upgrade-2",content:"Distcp will launch a mapreduce job to handle copying the files in a distributed fashion. Check the output of the distcp command to ensure this job completed successfully."},{heading:"performing-a-rollback-2",content:"Stop HBase"},{heading:"performing-a-rollback-2",content:"Perform a downgrade for HDFS and a downgrade/rollback for ZooKeeper (HBase should remain stopped)"},{heading:"performing-a-rollback-2",content:"Change the installed version of HBase to the previous version"},{heading:"performing-a-rollback-2",content:"Restore the HBase data directory from prior to the upgrade. Restore the HBase data directory from prior to the upgrade as the HDFS super user (shown below on a security enabled cluster). If you backed up your data on another HDFS cluster instead of locally, you will need to use the distcp command to copy it back to the current HDFS cluster."},{heading:"performing-a-rollback-2",content:"Restore the HBase data directory:"},{heading:"performing-a-rollback-2",content:"Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information."},{heading:"performing-a-rollback-2",content:"Clean HBase information out of ZooKeeper:"},{heading:"performing-a-rollback-2",content:"Start HBase"},{heading:"performing-a-rollback-2",content:"Verify HBase contents–use the HBase shell to list tables and scan some known values."}],headings:[{id:"caveats",content:"Caveats"},{id:"rollback-vs-downgrade",content:"Rollback vs Downgrade"},{id:"replication",content:"Replication"},{id:"data-locality",content:"Data Locality"},{id:"configurable-locations",content:"Configurable Locations"},{id:"all-service-rollback",content:"All service rollback"},{id:"requirements",content:"Requirements"},{id:"before-upgrade",content:"Before upgrade"},{id:"performing-a-rollback",content:"Performing a rollback"},{id:"rollback-after-hdfs-rollback-and-zookeeper-downgrade",content:"Rollback after HDFS rollback and ZooKeeper downgrade"},{id:"requirements-1",content:"Requirements"},{id:"before-upgrade-1",content:"Before upgrade"},{id:"performing-a-rollback-1",content:"Performing a rollback"},{id:"rollback-after-hdfs-downgrade",content:"Rollback after HDFS downgrade"},{id:"requirements-2",content:"Requirements"},{id:"before-upgrade-2",content:"Before upgrade"},{id:"performing-a-rollback-2",content:"Performing a rollback"}]};const p=[{depth:2,url:"#caveats",title:e.jsx(e.Fragment,{children:"Caveats"})},{depth:3,url:"#rollback-vs-downgrade",title:e.jsx(e.Fragment,{children:"Rollback vs Downgrade"})},{depth:3,url:"#replication",title:e.jsx(e.Fragment,{children:"Replication"})},{depth:3,url:"#data-locality",title:e.jsx(e.Fragment,{children:"Data Locality"})},{depth:3,url:"#configurable-locations",title:e.jsx(e.Fragment,{children:"Configurable Locations"})},{depth:2,url:"#all-service-rollback",title:e.jsx(e.Fragment,{children:"All service rollback"})},{depth:3,url:"#requirements",title:e.jsx(e.Fragment,{children:"Requirements"})},{depth:3,url:"#before-upgrade",title:e.jsx(e.Fragment,{children:"Before upgrade"})},{depth:3,url:"#performing-a-rollback",title:e.jsx(e.Fragment,{children:"Performing a rollback"})},{depth:2,url:"#rollback-after-hdfs-rollback-and-zookeeper-downgrade",title:e.jsx(e.Fragment,{children:"Rollback after HDFS rollback and ZooKeeper downgrade"})},{depth:3,url:"#requirements-1",title:e.jsx(e.Fragment,{children:"Requirements"})},{depth:3,url:"#before-upgrade-1",title:e.jsx(e.Fragment,{children:"Before upgrade"})},{depth:3,url:"#performing-a-rollback-1",title:e.jsx(e.Fragment,{children:"Performing a rollback"})},{depth:2,url:"#rollback-after-hdfs-downgrade",title:e.jsx(e.Fragment,{children:"Rollback after HDFS downgrade"})},{depth:3,url:"#requirements-2",title:e.jsx(e.Fragment,{children:"Requirements"})},{depth:3,url:"#before-upgrade-2",title:e.jsx(e.Fragment,{children:"Before upgrade"})},{depth:3,url:"#performing-a-rollback-2",title:e.jsx(e.Fragment,{children:"Performing a rollback"})}];function r(n){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components},{Step:a,Steps:o}=t;return a||s("Step"),o||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["Sometimes things don't go as planned when attempting an upgrade. This section explains how to perform a ",e.jsx(t.em,{children:"rollback"})," to an earlier HBase release. Note that this should only be needed between Major and some Minor releases. You should always be able to ",e.jsx(t.em,{children:"downgrade"})," between HBase Patch releases within the same Minor version. These instructions may require you to take steps before you start the upgrade process, so be sure to read through this section beforehand."]}),`
`,e.jsx(t.h2,{id:"caveats",children:"Caveats"}),`
`,e.jsx(t.h3,{id:"rollback-vs-downgrade",children:"Rollback vs Downgrade"}),`
`,e.jsxs(t.p,{children:["This section describes how to perform a ",e.jsx(t.em,{children:"rollback"})," on an upgrade between HBase minor and major versions. In this document, rollback refers to the process of taking an upgraded cluster and restoring it to the old version ",e.jsx(t.em,{children:"while losing all changes that have occurred since upgrade"}),". By contrast, a cluster ",e.jsx(t.em,{children:"downgrade"})," would restore an upgraded cluster to the old version while maintaining any data written since the upgrade. We currently only offer instructions to rollback HBase clusters. Further, rollback only works when these instructions are followed prior to performing the upgrade."]}),`
`,e.jsx(t.p,{children:"When these instructions talk about rollback vs downgrade of prerequisite cluster services (i.e. HDFS), you should treat leaving the service version the same as a degenerate case of downgrade."}),`
`,e.jsx(t.h3,{id:"replication",children:"Replication"}),`
`,e.jsx(t.p,{children:"Unless you are doing an all-service rollback, the HBase cluster will lose any configured peers for HBase replication. If your cluster is configured for HBase replication, then prior to following these instructions you should document all replication peers. After performing the rollback you should then add each documented peer back to the cluster. Note also that data written to the cluster since the upgrade may or may not have already been replicated to any peers. Determining which, if any, peers have seen replication data as well as rolling back the data in those peers is out of the scope of this guide."}),`
`,e.jsx(t.h3,{id:"data-locality",children:"Data Locality"}),`
`,e.jsx(t.p,{children:"Unless you are doing an all-service rollback, going through a rollback procedure will likely destroy all locality for Region Servers. You should expect degraded performance until after the cluster has had time to go through compactions to restore data locality. Optionally, you can force a compaction to speed this process up at the cost of generating cluster load."}),`
`,e.jsx(t.h3,{id:"configurable-locations",children:"Configurable Locations"}),`
`,e.jsx(t.p,{children:"The instructions below assume default locations for the HBase data directory and the HBase znode. Both of these locations are configurable and you should verify the value used in your cluster before proceeding. In the event that you have a different value, just replace the default with the one found in your configuration * HBase data directory is configured via the key 'hbase.rootdir' and has a default value of '/hbase'. * HBase znode is configured via the key 'zookeeper.znode.parent' and has a default value of '/hbase'."}),`
`,e.jsx(t.h2,{id:"all-service-rollback",children:"All service rollback"}),`
`,e.jsx(t.p,{children:"If you will be performing a rollback of both the HDFS and ZooKeeper services, then HBase's data will be rolled back in the process."}),`
`,e.jsx(t.h3,{id:"requirements",children:"Requirements"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Ability to rollback HDFS and ZooKeeper"}),`
`]}),`
`,e.jsx(t.h3,{id:"before-upgrade",children:"Before upgrade"}),`
`,e.jsx(t.p,{children:"No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance."}),`
`,e.jsx(t.h3,{id:"performing-a-rollback",children:"Performing a rollback"}),`
`,e.jsxs(o,{children:[e.jsx(a,{children:e.jsx(t.p,{children:"Stop HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Perform a rollback for HDFS and ZooKeeper (HBase should remain stopped)"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Change the installed version of HBase to the previous version"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Start HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Verify HBase contents — use the HBase shell to list tables and scan some known values."})})]}),`
`,e.jsx(t.h2,{id:"rollback-after-hdfs-rollback-and-zookeeper-downgrade",children:"Rollback after HDFS rollback and ZooKeeper downgrade"}),`
`,e.jsx(t.p,{children:"If you will be rolling back HDFS but going through a ZooKeeper downgrade, then HBase will be in an inconsistent state. You must ensure the cluster is not started until you complete this process."}),`
`,e.jsx(t.h3,{id:"requirements-1",children:"Requirements"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Ability to rollback HDFS"}),`
`,e.jsx(t.li,{children:"Ability to downgrade ZooKeeper"}),`
`]}),`
`,e.jsx(t.h3,{id:"before-upgrade-1",children:"Before upgrade"}),`
`,e.jsx(t.p,{children:"No additional steps are needed pre-upgrade. As an extra precautionary measure, you may wish to use distcp to back up the HBase data off of the cluster to be upgraded. To do so, follow the steps in the 'Before upgrade' section of 'Rollback after HDFS downgrade' but copy to another HDFS instance instead of within the same instance."}),`
`,e.jsx(t.h3,{id:"performing-a-rollback-1",children:"Performing a rollback"}),`
`,e.jsxs(o,{children:[e.jsx(a,{children:e.jsx(t.p,{children:"Stop HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Perform a rollback for HDFS and a downgrade for ZooKeeper (HBase should remain stopped)"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Change the installed version of HBase to the previous version"})}),e.jsxs(a,{children:[e.jsx(t.p,{children:"Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information."}),e.jsx(t.p,{children:e.jsx(t.strong,{children:"Clean HBase information out of ZooKeeper:"})}),e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ zookeeper-client -server zookeeper1.example.com:2181,zookeeper2.example.com:2181,zookeeper3.example.com:2181"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Welcome"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ZooKeeper!"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"JLine"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" support"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" disabled"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"rmr"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"quit"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Quitting..."})})]})})})]}),e.jsx(a,{children:e.jsx(t.p,{children:"Start HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Verify HBase contents—use the HBase shell to list tables and scan some known values."})})]}),`
`,e.jsx(t.h2,{id:"rollback-after-hdfs-downgrade",children:"Rollback after HDFS downgrade"}),`
`,e.jsx(t.p,{children:"If you will be performing an HDFS downgrade, then you'll need to follow these instructions regardless of whether ZooKeeper goes through rollback, downgrade, or reinstallation."}),`
`,e.jsx(t.h3,{id:"requirements-2",children:"Requirements"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Ability to downgrade HDFS"}),`
`,e.jsx(t.li,{children:"Pre-upgrade cluster must be able to run MapReduce jobs"}),`
`,e.jsx(t.li,{children:"HDFS super user access"}),`
`,e.jsx(t.li,{children:"Sufficient space in HDFS for at least two copies of the HBase data directory"}),`
`]}),`
`,e.jsx(t.h3,{id:"before-upgrade-2",children:"Before upgrade"}),`
`,e.jsx(t.p,{children:"Before beginning the upgrade process, you must take a complete backup of HBase's backing data. The following instructions cover backing up the data within the current HDFS instance. Alternatively, you can use the distcp command to copy the data to another HDFS cluster."}),`
`,e.jsxs(o,{children:[e.jsx(a,{children:e.jsx(t.p,{children:"Stop the HBase cluster"})}),e.jsxs(a,{children:[e.jsxs(t.p,{children:["Copy the HBase data directory to a backup location using the ",e.jsx(t.a,{href:"https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html",children:"distcp command"})," as the HDFS super user (shown below on a security enabled cluster)"]}),e.jsx(t.p,{children:e.jsx(t.strong,{children:"Using distcp to backup the HBase data directory:"})}),e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ kinit -k -t hdfs.keytab hdfs@EXAMPLE.COM"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ hadoop distcp /hbase /hbase-pre-upgrade-backup"})]})]})})})]}),e.jsx(a,{children:e.jsx(t.p,{children:"Distcp will launch a mapreduce job to handle copying the files in a distributed fashion. Check the output of the distcp command to ensure this job completed successfully."})})]}),`
`,e.jsx(t.h3,{id:"performing-a-rollback-2",children:"Performing a rollback"}),`
`,e.jsxs(o,{children:[e.jsx(a,{children:e.jsx(t.p,{children:"Stop HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Perform a downgrade for HDFS and a downgrade/rollback for ZooKeeper (HBase should remain stopped)"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Change the installed version of HBase to the previous version"})}),e.jsxs(a,{children:[e.jsx(t.p,{children:"Restore the HBase data directory from prior to the upgrade. Restore the HBase data directory from prior to the upgrade as the HDFS super user (shown below on a security enabled cluster). If you backed up your data on another HDFS cluster instead of locally, you will need to use the distcp command to copy it back to the current HDFS cluster."}),e.jsx(t.p,{children:e.jsx(t.strong,{children:"Restore the HBase data directory:"})}),e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ kinit -k -t hdfs.keytab hdfs@EXAMPLE.COM"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ hdfs dfs -mv /hbase /hbase-upgrade-rollback"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ hdfs dfs -mv /hbase-pre-upgrade-backup /hbase"})]})]})})})]}),e.jsxs(a,{children:[e.jsx(t.p,{children:"Clean out ZooKeeper information related to HBase. WARNING: This step will permanently destroy all replication peers. Please see the section on HBase Replication under Caveats for more information."}),e.jsx(t.p,{children:e.jsx(t.strong,{children:"Clean HBase information out of ZooKeeper:"})}),e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[hpnewton@gateway_node.example.com "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"~"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]$ zookeeper-client -server zookeeper1.example.com:2181,zookeeper2.example.com:2181,zookeeper3.example.com:2181"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Welcome"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ZooKeeper!"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"JLine"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" support"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" disabled"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"rmr"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"quit"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Quitting..."})})]})})})]}),e.jsx(a,{children:e.jsx(t.p,{children:"Start HBase"})}),e.jsx(a,{children:e.jsx(t.p,{children:"Verify HBase contents–use the HBase shell to list tables and scan some known values."})})]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(r,{...n})}):r(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,u as default,c as extractedReferences,d as frontmatter,h as structuredData,p as toc};
