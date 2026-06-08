import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let a=`\`HMaster\` is the implementation of the Master Server. The Master server is responsible for monitoring all RegionServer instances in the cluster, and is the interface for all metadata changes. In a distributed cluster, the Master typically runs on the [NameNode](/docs/architecture/hdfs#hdfs-namenode). J Mohamed Zahoor goes into some more detail on the Master Architecture in this blog posting, [HBase HMaster Architecture](https://web.archive.org/web/20191211053128/http://blog.zahoor.in/2012/08/hbase-hmaster-architecture/).

## Startup Behavior

If run in a multi-Master environment, all Masters compete to run the cluster. If the active Master loses its lease in ZooKeeper (or the Master shuts down), then the remaining Masters jostle to take over the Master role.

## Runtime Impact

A common dist-list question involves what happens to an HBase cluster when the Master goes down. This information has changed starting 3.0.0.

### Up until releases 2.x.y

Because the HBase client talks directly to the RegionServers, the cluster can still function in a "steady state". Additionally, per [Catalog Tables](/docs/architecture/catalog-tables), \`hbase:meta\` exists as an HBase table and is not resident in the Master. However, the Master controls critical functions such as RegionServer failover and completing region splits. So while the cluster can still run for a short time without the Master, the Master should be restarted as soon as possible.

### Staring release 3.0.0

As mentioned in section [Master Registry (new as of 2.3.0)](/docs/architecture/client#masterregistry-rpc-hedging), the default connection registry for clients is now based on master rpc end points. Hence the requirements for masters' uptime are even tighter starting this release.

* At least one active or stand by master is needed for a connection set up, unlike before when all the clients needed was a ZooKeeper ensemble.
* Master is now in critical path for read/write operations. For example, if the meta region bounces off to a different region server, clients need master to fetch the new locations. Earlier this was done by fetching this information directly from ZooKeeper.
* Masters will now have higher connection load than before. So, the server side configuration might need adjustment depending on the load.

Overall, the master uptime requirements, when this feature is enabled, are even higher for the client operations to go through.

## Interface

The methods exposed by \`HMasterInterface\` are primarily metadata-oriented methods:

* Table (createTable, modifyTable, removeTable, enable, disable)
* ColumnFamily (addColumn, modifyColumn, removeColumn)
* Region (move, assign, unassign) For example, when the \`Admin\` method \`disableTable\` is invoked, it is serviced by the Master server.

## Processes

The Master runs several background threads:

### LoadBalancer

Periodically, and when there are no regions in transition, a load balancer will run and move regions around to balance the cluster's load. See [Balancer](/docs/configuration/important#balancer) for configuring this property.

See [Region-RegionServer Assignment](/docs/architecture/regions#region-regionserver-assignment) for more information on region assignment.

### CatalogJanitor

Periodically checks and cleans up the \`hbase:meta\` table. See [hbase:meta](/docs/architecture/catalog-tables#hbasemeta) for more information on the meta table.

## MasterProcWAL

*MasterProcWAL is replaced in hbase-2.3.0 by an alternate Procedure Store implementation; see [in-master-procedure-store-region](/docs/upgrading/paths#new-in-master-procedure-store). This section pertains to hbase-2.0.0 through hbase-2.2.x*

HMaster records administrative operations and their running states, such as the handling of a crashed server, table creation, and other DDLs, into a Procedure Store. The Procedure Store WALs are stored under the MasterProcWALs directory. The Master WALs are not like RegionServer WALs. Keeping up the Master WAL allows us to run a state machine that is resilient across Master failures. For example, if a HMaster was in the middle of creating a table encounters an issue and fails, the next active HMaster can take up where the previous left off and carry the operation to completion. Since hbase-2.0.0, a new AssignmentManager (A.K.A AMv2) was introduced and the HMaster handles region assignment operations, server crash processing, balancing, etc., all via AMv2 persisting all state and transitions into MasterProcWALs rather than up into ZooKeeper, as we do in hbase-1.x.

See [AMv2 Description for Devs](/docs/amv2) (and [Procedure Framework (Pv2): HBASE-12439](/docs/pv2) for its basis) if you would like to learn more about the new AssignmentManager.

### Configurations for MasterProcWAL

Here are the list of configurations that effect MasterProcWAL operation. You should not have to change your defaults.

* **\`hbase.procedure.store.wal.periodic.roll.msec\`**\\
  **Description:** Frequency of generating a new WAL\\
  **Default:** \`1h (3600000 in msec)\`

* **\`hbase.procedure.store.wal.roll.threshold\`**\\
  **Description:** Threshold in size before the WAL rolls. Every time the WAL reaches this size or the above period, 1 hour, passes since last log roll, the HMaster will generate a new WAL.\\
  **Default:** \`32MB (33554432 in byte)\`

* **\`hbase.procedure.store.wal.warn.threshold\`**\\
  **Description:** If the number of WALs goes beyond this threshold, the following message should appear in the HMaster log with WARN level when rolling.

  \`\`\`
  procedure WALs count=xx above the warning threshold 64. check running procedures to see if something is stuck.
  \`\`\`

  **Default:** \`64\`

* **\`hbase.procedure.store.wal.max.retries.before.roll\`**\\
  **Description:** Max number of retry when syncing slots (records) to its underlying storage, such as HDFS. Every attempt, the following message should appear in the HMaster log.

  \`\`\`
  unable to sync slots, retry=xx
  \`\`\`

  **Default:** \`3\`

* **\`hbase.procedure.store.wal.sync.failure.roll.max\`**\\
  **Description:** After the above 3 retrials, the log is rolled and the retry count is reset to 0, thereon a new set of retrial starts. This configuration controls the max number of attempts of log rolling upon sync failure. That is, HMaster is allowed to fail to sync 9 times in total. Once it exceeds, the following log should appear in the HMaster log.
  \`\`\`
  Sync slots after log roll failed, abort.
  \`\`\`
  **Default:** \`3\`
`,o={title:"Master",description:"HBase Master server responsibilities including RegionServer monitoring, metadata operations, load balancing, and failover behavior."},i=[{href:"/docs/architecture/hdfs#hdfs-namenode"},{href:"https://web.archive.org/web/20191211053128/http://blog.zahoor.in/2012/08/hbase-hmaster-architecture/"},{href:"/docs/architecture/catalog-tables"},{href:"/docs/architecture/client#masterregistry-rpc-hedging"},{href:"/docs/configuration/important#balancer"},{href:"/docs/architecture/regions#region-regionserver-assignment"},{href:"/docs/architecture/catalog-tables#hbasemeta"},{href:"/docs/upgrading/paths#new-in-master-procedure-store"},{href:"/docs/amv2"},{href:"/docs/pv2"}],l={contents:[{heading:void 0,content:"HMaster is the implementation of the Master Server. The Master server is responsible for monitoring all RegionServer instances in the cluster, and is the interface for all metadata changes. In a distributed cluster, the Master typically runs on the NameNode. J Mohamed Zahoor goes into some more detail on the Master Architecture in this blog posting, HBase HMaster Architecture."},{heading:"startup-behavior",content:"If run in a multi-Master environment, all Masters compete to run the cluster. If the active Master loses its lease in ZooKeeper (or the Master shuts down), then the remaining Masters jostle to take over the Master role."},{heading:"runtime-impact",content:"A common dist-list question involves what happens to an HBase cluster when the Master goes down. This information has changed starting 3.0.0."},{heading:"up-until-releases-2xy",content:'Because the HBase client talks directly to the RegionServers, the cluster can still function in a "steady state". Additionally, per Catalog Tables, hbase:meta exists as an HBase table and is not resident in the Master. However, the Master controls critical functions such as RegionServer failover and completing region splits. So while the cluster can still run for a short time without the Master, the Master should be restarted as soon as possible.'},{heading:"staring-release-300",content:"As mentioned in section Master Registry (new as of 2.3.0), the default connection registry for clients is now based on master rpc end points. Hence the requirements for masters' uptime are even tighter starting this release."},{heading:"staring-release-300",content:"At least one active or stand by master is needed for a connection set up, unlike before when all the clients needed was a ZooKeeper ensemble."},{heading:"staring-release-300",content:"Master is now in critical path for read/write operations. For example, if the meta region bounces off to a different region server, clients need master to fetch the new locations. Earlier this was done by fetching this information directly from ZooKeeper."},{heading:"staring-release-300",content:"Masters will now have higher connection load than before. So, the server side configuration might need adjustment depending on the load."},{heading:"staring-release-300",content:"Overall, the master uptime requirements, when this feature is enabled, are even higher for the client operations to go through."},{heading:"architecture-master-interface",content:"The methods exposed by HMasterInterface are primarily metadata-oriented methods:"},{heading:"architecture-master-interface",content:"Table (createTable, modifyTable, removeTable, enable, disable)"},{heading:"architecture-master-interface",content:"ColumnFamily (addColumn, modifyColumn, removeColumn)"},{heading:"architecture-master-interface",content:"Region (move, assign, unassign) For example, when the Admin method disableTable is invoked, it is serviced by the Master server."},{heading:"architecture-master-processes",content:"The Master runs several background threads:"},{heading:"loadbalancer",content:"Periodically, and when there are no regions in transition, a load balancer will run and move regions around to balance the cluster's load. See Balancer for configuring this property."},{heading:"loadbalancer",content:"See Region-RegionServer Assignment for more information on region assignment."},{heading:"catalogjanitor",content:"Periodically checks and cleans up the hbase:meta table. See hbase:meta for more information on the meta table."},{heading:"masterprocwal",content:"MasterProcWAL is replaced in hbase-2.3.0 by an alternate Procedure Store implementation; see in-master-procedure-store-region. This section pertains to hbase-2.0.0 through hbase-2.2.x"},{heading:"masterprocwal",content:"HMaster records administrative operations and their running states, such as the handling of a crashed server, table creation, and other DDLs, into a Procedure Store. The Procedure Store WALs are stored under the MasterProcWALs directory. The Master WALs are not like RegionServer WALs. Keeping up the Master WAL allows us to run a state machine that is resilient across Master failures. For example, if a HMaster was in the middle of creating a table encounters an issue and fails, the next active HMaster can take up where the previous left off and carry the operation to completion. Since hbase-2.0.0, a new AssignmentManager (A.K.A AMv2) was introduced and the HMaster handles region assignment operations, server crash processing, balancing, etc., all via AMv2 persisting all state and transitions into MasterProcWALs rather than up into ZooKeeper, as we do in hbase-1.x."},{heading:"masterprocwal",content:"See AMv2 Description for Devs (and Procedure Framework (Pv2): HBASE-12439 for its basis) if you would like to learn more about the new AssignmentManager."},{heading:"configurations-for-masterprocwal",content:"Here are the list of configurations that effect MasterProcWAL operation. You should not have to change your defaults."},{heading:"configurations-for-masterprocwal",content:"hbase.procedure.store.wal.periodic.roll.msecDescription: Frequency of generating a new WALDefault: 1h (3600000 in msec)"},{heading:"configurations-for-masterprocwal",content:"hbase.procedure.store.wal.roll.thresholdDescription: Threshold in size before the WAL rolls. Every time the WAL reaches this size or the above period, 1 hour, passes since last log roll, the HMaster will generate a new WAL.Default: 32MB (33554432 in byte)"},{heading:"configurations-for-masterprocwal",content:"hbase.procedure.store.wal.warn.thresholdDescription: If the number of WALs goes beyond this threshold, the following message should appear in the HMaster log with WARN level when rolling."},{heading:"configurations-for-masterprocwal",content:"Default: 64"},{heading:"configurations-for-masterprocwal",content:"hbase.procedure.store.wal.max.retries.before.rollDescription: Max number of retry when syncing slots (records) to its underlying storage, such as HDFS. Every attempt, the following message should appear in the HMaster log."},{heading:"configurations-for-masterprocwal",content:"Default: 3"},{heading:"configurations-for-masterprocwal",content:"hbase.procedure.store.wal.sync.failure.roll.maxDescription: After the above 3 retrials, the log is rolled and the retry count is reset to 0, thereon a new set of retrial starts. This configuration controls the max number of attempts of log rolling upon sync failure. That is, HMaster is allowed to fail to sync 9 times in total. Once it exceeds, the following log should appear in the HMaster log."},{heading:"configurations-for-masterprocwal",content:"Default: 3"}],headings:[{id:"startup-behavior",content:"Startup Behavior"},{id:"runtime-impact",content:"Runtime Impact"},{id:"up-until-releases-2xy",content:"Up until releases 2.x.y"},{id:"staring-release-300",content:"Staring release 3.0.0"},{id:"architecture-master-interface",content:"Interface"},{id:"architecture-master-processes",content:"Processes"},{id:"loadbalancer",content:"LoadBalancer"},{id:"catalogjanitor",content:"CatalogJanitor"},{id:"masterprocwal",content:"MasterProcWAL"},{id:"configurations-for-masterprocwal",content:"Configurations for MasterProcWAL"}]};const h=[{depth:2,url:"#startup-behavior",title:e.jsx(e.Fragment,{children:"Startup Behavior"})},{depth:2,url:"#runtime-impact",title:e.jsx(e.Fragment,{children:"Runtime Impact"})},{depth:3,url:"#up-until-releases-2xy",title:e.jsx(e.Fragment,{children:"Up until releases 2.x.y"})},{depth:3,url:"#staring-release-300",title:e.jsx(e.Fragment,{children:"Staring release 3.0.0"})},{depth:2,url:"#architecture-master-interface",title:e.jsx(e.Fragment,{children:"Interface"})},{depth:2,url:"#architecture-master-processes",title:e.jsx(e.Fragment,{children:"Processes"})},{depth:3,url:"#loadbalancer",title:e.jsx(e.Fragment,{children:"LoadBalancer"})},{depth:3,url:"#catalogjanitor",title:e.jsx(e.Fragment,{children:"CatalogJanitor"})},{depth:2,url:"#masterprocwal",title:e.jsx(e.Fragment,{children:"MasterProcWAL"})},{depth:3,url:"#configurations-for-masterprocwal",title:e.jsx(e.Fragment,{children:"Configurations for MasterProcWAL"})}];function n(r){const t={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...r.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:[e.jsx(t.code,{children:"HMaster"})," is the implementation of the Master Server. The Master server is responsible for monitoring all RegionServer instances in the cluster, and is the interface for all metadata changes. In a distributed cluster, the Master typically runs on the ",e.jsx(t.a,{href:"/docs/architecture/hdfs#hdfs-namenode",children:"NameNode"}),". J Mohamed Zahoor goes into some more detail on the Master Architecture in this blog posting, ",e.jsx(t.a,{href:"https://web.archive.org/web/20191211053128/http://blog.zahoor.in/2012/08/hbase-hmaster-architecture/",children:"HBase HMaster Architecture"}),"."]}),`
`,e.jsx(t.h2,{id:"startup-behavior",children:"Startup Behavior"}),`
`,e.jsx(t.p,{children:"If run in a multi-Master environment, all Masters compete to run the cluster. If the active Master loses its lease in ZooKeeper (or the Master shuts down), then the remaining Masters jostle to take over the Master role."}),`
`,e.jsx(t.h2,{id:"runtime-impact",children:"Runtime Impact"}),`
`,e.jsx(t.p,{children:"A common dist-list question involves what happens to an HBase cluster when the Master goes down. This information has changed starting 3.0.0."}),`
`,e.jsx(t.h3,{id:"up-until-releases-2xy",children:"Up until releases 2.x.y"}),`
`,e.jsxs(t.p,{children:['Because the HBase client talks directly to the RegionServers, the cluster can still function in a "steady state". Additionally, per ',e.jsx(t.a,{href:"/docs/architecture/catalog-tables",children:"Catalog Tables"}),", ",e.jsx(t.code,{children:"hbase:meta"})," exists as an HBase table and is not resident in the Master. However, the Master controls critical functions such as RegionServer failover and completing region splits. So while the cluster can still run for a short time without the Master, the Master should be restarted as soon as possible."]}),`
`,e.jsx(t.h3,{id:"staring-release-300",children:"Staring release 3.0.0"}),`
`,e.jsxs(t.p,{children:["As mentioned in section ",e.jsx(t.a,{href:"/docs/architecture/client#masterregistry-rpc-hedging",children:"Master Registry (new as of 2.3.0)"}),", the default connection registry for clients is now based on master rpc end points. Hence the requirements for masters' uptime are even tighter starting this release."]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"At least one active or stand by master is needed for a connection set up, unlike before when all the clients needed was a ZooKeeper ensemble."}),`
`,e.jsx(t.li,{children:"Master is now in critical path for read/write operations. For example, if the meta region bounces off to a different region server, clients need master to fetch the new locations. Earlier this was done by fetching this information directly from ZooKeeper."}),`
`,e.jsx(t.li,{children:"Masters will now have higher connection load than before. So, the server side configuration might need adjustment depending on the load."}),`
`]}),`
`,e.jsx(t.p,{children:"Overall, the master uptime requirements, when this feature is enabled, are even higher for the client operations to go through."}),`
`,e.jsx(t.h2,{id:"architecture-master-interface",children:"Interface"}),`
`,e.jsxs(t.p,{children:["The methods exposed by ",e.jsx(t.code,{children:"HMasterInterface"})," are primarily metadata-oriented methods:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Table (createTable, modifyTable, removeTable, enable, disable)"}),`
`,e.jsx(t.li,{children:"ColumnFamily (addColumn, modifyColumn, removeColumn)"}),`
`,e.jsxs(t.li,{children:["Region (move, assign, unassign) For example, when the ",e.jsx(t.code,{children:"Admin"})," method ",e.jsx(t.code,{children:"disableTable"})," is invoked, it is serviced by the Master server."]}),`
`]}),`
`,e.jsx(t.h2,{id:"architecture-master-processes",children:"Processes"}),`
`,e.jsx(t.p,{children:"The Master runs several background threads:"}),`
`,e.jsx(t.h3,{id:"loadbalancer",children:"LoadBalancer"}),`
`,e.jsxs(t.p,{children:["Periodically, and when there are no regions in transition, a load balancer will run and move regions around to balance the cluster's load. See ",e.jsx(t.a,{href:"/docs/configuration/important#balancer",children:"Balancer"})," for configuring this property."]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/architecture/regions#region-regionserver-assignment",children:"Region-RegionServer Assignment"})," for more information on region assignment."]}),`
`,e.jsx(t.h3,{id:"catalogjanitor",children:"CatalogJanitor"}),`
`,e.jsxs(t.p,{children:["Periodically checks and cleans up the ",e.jsx(t.code,{children:"hbase:meta"})," table. See ",e.jsx(t.a,{href:"/docs/architecture/catalog-tables#hbasemeta",children:"hbase:meta"})," for more information on the meta table."]}),`
`,e.jsx(t.h2,{id:"masterprocwal",children:"MasterProcWAL"}),`
`,e.jsx(t.p,{children:e.jsxs(t.em,{children:["MasterProcWAL is replaced in hbase-2.3.0 by an alternate Procedure Store implementation; see ",e.jsx(t.a,{href:"/docs/upgrading/paths#new-in-master-procedure-store",children:"in-master-procedure-store-region"}),". This section pertains to hbase-2.0.0 through hbase-2.2.x"]})}),`
`,e.jsx(t.p,{children:"HMaster records administrative operations and their running states, such as the handling of a crashed server, table creation, and other DDLs, into a Procedure Store. The Procedure Store WALs are stored under the MasterProcWALs directory. The Master WALs are not like RegionServer WALs. Keeping up the Master WAL allows us to run a state machine that is resilient across Master failures. For example, if a HMaster was in the middle of creating a table encounters an issue and fails, the next active HMaster can take up where the previous left off and carry the operation to completion. Since hbase-2.0.0, a new AssignmentManager (A.K.A AMv2) was introduced and the HMaster handles region assignment operations, server crash processing, balancing, etc., all via AMv2 persisting all state and transitions into MasterProcWALs rather than up into ZooKeeper, as we do in hbase-1.x."}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/amv2",children:"AMv2 Description for Devs"})," (and ",e.jsx(t.a,{href:"/docs/pv2",children:"Procedure Framework (Pv2): HBASE-12439"})," for its basis) if you would like to learn more about the new AssignmentManager."]}),`
`,e.jsx(t.h3,{id:"configurations-for-masterprocwal",children:"Configurations for MasterProcWAL"}),`
`,e.jsx(t.p,{children:"Here are the list of configurations that effect MasterProcWAL operation. You should not have to change your defaults."}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"hbase.procedure.store.wal.periodic.roll.msec"})}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Description:"})," Frequency of generating a new WAL",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1h (3600000 in msec)"})]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"hbase.procedure.store.wal.roll.threshold"})}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Description:"})," Threshold in size before the WAL rolls. Every time the WAL reaches this size or the above period, 1 hour, passes since last log roll, the HMaster will generate a new WAL.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"32MB (33554432 in byte)"})]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"hbase.procedure.store.wal.warn.threshold"})}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Description:"})," If the number of WALs goes beyond this threshold, the following message should appear in the HMaster log with WARN level when rolling."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"procedure WALs count=xx above the warning threshold 64. check running procedures to see if something is stuck."})})})})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"64"})]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"hbase.procedure.store.wal.max.retries.before.roll"})}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Description:"})," Max number of retry when syncing slots (records) to its underlying storage, such as HDFS. Every attempt, the following message should appear in the HMaster log."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"unable to sync slots, retry=xx"})})})})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"hbase.procedure.store.wal.sync.failure.roll.max"})}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Description:"})," After the above 3 retrials, the log is rolled and the retry count is reset to 0, thereon a new set of retrial starts. This configuration controls the max number of attempts of log rolling upon sync failure. That is, HMaster is allowed to fail to sync 9 times in total. Once it exceeds, the following log should appear in the HMaster log."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"Sync slots after log roll failed, abort."})})})})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`]}),`
`]})]})}function c(r={}){const{wrapper:t}=r.components||{};return t?e.jsx(t,{...r,children:e.jsx(n,{...r})}):n(r)}export{a as _markdown,c as default,i as extractedReferences,o as frontmatter,l as structuredData,h as toc};
