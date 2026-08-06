import{j as e}from"./components-BCHf_v1I.js";let a=`## Background

The current [Cluster Replication](/docs/operational-management/cluster-replication) in HBase in asynchronous. So if the master cluster crashes, the slave cluster may not have the
newest data. If users want strong consistency then they can not switch to the slave cluster.

## Design

Please see the design doc on [HBASE-19064](https://issues.apache.org/jira/browse/HBASE-19064)

## Operation and maintenance

### Case.1 Setup two synchronous replication clusters

* Add a synchronous peer in both source cluster and peer cluster.

For source cluster:

\`\`\`ruby
hbase> add_peer  '1', CLUSTER_KEY => 'lg-hadoop-tst-st01.bj:10010,lg-hadoop-tst-st02.bj:10010,lg-hadoop-tst-st03.bj:10010:/hbase/test-hbase-slave', REMOTE_WAL_DIR=>'hdfs://lg-hadoop-tst-st01.bj:20100/hbase/test-hbase-slave/remoteWALs', TABLE_CFS => {"ycsb-test"=>[]}
\`\`\`

For peer cluster:

\`\`\`ruby
hbase> add_peer  '1', CLUSTER_KEY => 'lg-hadoop-tst-st01.bj:10010,lg-hadoop-tst-st02.bj:10010,lg-hadoop-tst-st03.bj:10010:/hbase/test-hbase', REMOTE_WAL_DIR=>'hdfs://lg-hadoop-tst-st01.bj:20100/hbase/test-hbase/remoteWALs', TABLE_CFS => {"ycsb-test"=>[]}
\`\`\`

<Callout type="info">
  For synchronous replication, the current implementation require that we have the same peer id for
  both source and peer cluster. Another thing that need attention is: the peer does not support
  cluster-level, namespace-level, or cf-level replication, only support table-level replication now.
</Callout>

* Transit the peer cluster to be STANDBY state

  \`\`\`ruby
  hbase> transit_peer_sync_replication_state '1', 'STANDBY'
  \`\`\`

* Transit the source cluster to be ACTIVE state
  \`\`\`ruby
  hbase> transit_peer_sync_replication_state '1', 'ACTIVE'
  \`\`\`

Now, the synchronous replication has been set up successfully. the HBase client can only request to source cluster, if
request to peer cluster, the peer cluster which is STANDBY state now will reject the read/write requests.

### Case.2 How to operate when standby cluster crashed

If the standby cluster has been crashed, it will fail to write remote WAL for the active cluster. So we need to transit
the source cluster to DOWNGRANDE\\_ACTIVE state, which means source cluster won't write any remote WAL any more, but
the normal replication (asynchronous Replication) can still work fine, it queue the newly written WALs, but the
replication block until the peer cluster come back.

\`\`\`ruby
hbase> transit_peer_sync_replication_state '1', 'DOWNGRADE_ACTIVE'
\`\`\`

Once the peer cluster come back, we can just transit the source cluster to ACTIVE, to ensure that the replication will be
synchronous.

\`\`\`ruby
hbase> transit_peer_sync_replication_state '1', 'ACTIVE'
\`\`\`

### Case.3 How to operate when active cluster crashed

If the active cluster has been crashed (it may be not reachable now), so let's just transit the standby cluster to
DOWNGRADE\\_ACTIVE state, and after that, we should redirect all the requests from client to the DOWNGRADE\\_ACTIVE cluster.

\`\`\`ruby
hbase> transit_peer_sync_replication_state '1', 'DOWNGRADE_ACTIVE'
\`\`\`

If the crashed cluster come back again, we just need to transit it to STANDBY directly. Otherwise if you transit the
cluster to DOWNGRADE\\_ACTIVE, the original ACTIVE cluster may have redundant data compared to the current ACTIVE
cluster. Because we designed to write source cluster WALs and remote cluster WALs concurrently, so it's possible that
the source cluster WALs has more data than the remote cluster, which result in data inconsistency. The procedure of
transiting ACTIVE to STANDBY has no problem, because we'll skip to replay the original WALs.

\`\`\`ruby
hbase> transit_peer_sync_replication_state '1', 'STANDBY'
\`\`\`

After that, we can promote the DOWNGRADE\\_ACTIVE cluster to ACTIVE now, to ensure that the replication will be synchronous.

\`\`\`ruby
hbase> transit_peer_sync_replication_state '1', 'ACTIVE'
\`\`\`
`,l={title:"Synchronous Replication",description:"Setting up synchronous replication between HBase clusters for strong consistency and automatic failover capabilities."},c=[{href:"/docs/operational-management/cluster-replication"},{href:"https://issues.apache.org/jira/browse/HBASE-19064"}],o={contents:[{heading:"sync-replication-background",content:`The current Cluster Replication in HBase in asynchronous. So if the master cluster crashes, the slave cluster may not have the
newest data. If users want strong consistency then they can not switch to the slave cluster.`},{heading:"design",content:"Please see the design doc on HBASE-19064"},{heading:"case1-setup-two-synchronous-replication-clusters",content:"Add a synchronous peer in both source cluster and peer cluster."},{heading:"case1-setup-two-synchronous-replication-clusters",content:"For source cluster:"},{heading:"case1-setup-two-synchronous-replication-clusters",content:"For peer cluster:"},{heading:"case1-setup-two-synchronous-replication-clusters",content:`For synchronous replication, the current implementation require that we have the same peer id for
both source and peer cluster. Another thing that need attention is: the peer does not support
cluster-level, namespace-level, or cf-level replication, only support table-level replication now.`},{heading:"case1-setup-two-synchronous-replication-clusters",content:"Transit the peer cluster to be STANDBY state"},{heading:"case1-setup-two-synchronous-replication-clusters",content:"Transit the source cluster to be ACTIVE state"},{heading:"case1-setup-two-synchronous-replication-clusters",content:`Now, the synchronous replication has been set up successfully. the HBase client can only request to source cluster, if
request to peer cluster, the peer cluster which is STANDBY state now will reject the read/write requests.`},{heading:"case2-how-to-operate-when-standby-cluster-crashed",content:`If the standby cluster has been crashed, it will fail to write remote WAL for the active cluster. So we need to transit
the source cluster to DOWNGRANDE\\_ACTIVE state, which means source cluster won't write any remote WAL any more, but
the normal replication (asynchronous Replication) can still work fine, it queue the newly written WALs, but the
replication block until the peer cluster come back.`},{heading:"case2-how-to-operate-when-standby-cluster-crashed",content:`Once the peer cluster come back, we can just transit the source cluster to ACTIVE, to ensure that the replication will be
synchronous.`},{heading:"case3-how-to-operate-when-active-cluster-crashed",content:`If the active cluster has been crashed (it may be not reachable now), so let's just transit the standby cluster to
DOWNGRADE\\_ACTIVE state, and after that, we should redirect all the requests from client to the DOWNGRADE\\_ACTIVE cluster.`},{heading:"case3-how-to-operate-when-active-cluster-crashed",content:`If the crashed cluster come back again, we just need to transit it to STANDBY directly. Otherwise if you transit the
cluster to DOWNGRADE\\_ACTIVE, the original ACTIVE cluster may have redundant data compared to the current ACTIVE
cluster. Because we designed to write source cluster WALs and remote cluster WALs concurrently, so it's possible that
the source cluster WALs has more data than the remote cluster, which result in data inconsistency. The procedure of
transiting ACTIVE to STANDBY has no problem, because we'll skip to replay the original WALs.`},{heading:"case3-how-to-operate-when-active-cluster-crashed",content:"After that, we can promote the DOWNGRADE\\_ACTIVE cluster to ACTIVE now, to ensure that the replication will be synchronous."}],headings:[{id:"sync-replication-background",content:"Background"},{id:"design",content:"Design"},{id:"operation-and-maintenance",content:"Operation and maintenance"},{id:"case1-setup-two-synchronous-replication-clusters",content:"Case.1 Setup two synchronous replication clusters"},{id:"case2-how-to-operate-when-standby-cluster-crashed",content:"Case.2 How to operate when standby cluster crashed"},{id:"case3-how-to-operate-when-active-cluster-crashed",content:"Case.3 How to operate when active cluster crashed"}]},d=[{depth:2,url:"#sync-replication-background",title:e.jsx(e.Fragment,{children:"Background"})},{depth:2,url:"#design",title:e.jsx(e.Fragment,{children:"Design"})},{depth:2,url:"#operation-and-maintenance",title:e.jsx(e.Fragment,{children:"Operation and maintenance"})},{depth:3,url:"#case1-setup-two-synchronous-replication-clusters",title:e.jsx(e.Fragment,{children:"Case.1 Setup two synchronous replication clusters"})},{depth:3,url:"#case2-how-to-operate-when-standby-cluster-crashed",title:e.jsx(e.Fragment,{children:"Case.2 How to operate when standby cluster crashed"})},{depth:3,url:"#case3-how-to-operate-when-active-cluster-crashed",title:e.jsx(e.Fragment,{children:"Case.3 How to operate when active cluster crashed"})}];function n(t){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...t.components},{Callout:i}=s;return i||r("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"sync-replication-background",children:"Background"}),`
`,e.jsxs(s.p,{children:["The current ",e.jsx(s.a,{href:"/docs/operational-management/cluster-replication",children:"Cluster Replication"}),` in HBase in asynchronous. So if the master cluster crashes, the slave cluster may not have the
newest data. If users want strong consistency then they can not switch to the slave cluster.`]}),`
`,e.jsx(s.h2,{id:"design",children:"Design"}),`
`,e.jsxs(s.p,{children:["Please see the design doc on ",e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-19064",children:"HBASE-19064"})]}),`
`,e.jsx(s.h2,{id:"operation-and-maintenance",children:"Operation and maintenance"}),`
`,e.jsx(s.h3,{id:"case1-setup-two-synchronous-replication-clusters",children:"Case.1 Setup two synchronous replication clusters"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Add a synchronous peer in both source cluster and peer cluster."}),`
`]}),`
`,e.jsx(s.p,{children:"For source cluster:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" add_peer  "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"CLUSTER_KEY"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'lg-hadoop-tst-st01.bj:10010,lg-hadoop-tst-st02.bj:10010,lg-hadoop-tst-st03.bj:10010:/hbase/test-hbase-slave'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"REMOTE_WAL_DIR"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=>"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hdfs://lg-hadoop-tst-st01.bj:20100/hbase/test-hbase-slave/remoteWALs'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"TABLE_CFS"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ycsb-test"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=>[]}"})]})})})}),`
`,e.jsx(s.p,{children:"For peer cluster:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" add_peer  "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"CLUSTER_KEY"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'lg-hadoop-tst-st01.bj:10010,lg-hadoop-tst-st02.bj:10010,lg-hadoop-tst-st03.bj:10010:/hbase/test-hbase'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"REMOTE_WAL_DIR"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=>"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hdfs://lg-hadoop-tst-st01.bj:20100/hbase/test-hbase/remoteWALs'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"TABLE_CFS"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ycsb-test"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=>[]}"})]})})})}),`
`,e.jsx(i,{type:"info",children:e.jsx(s.p,{children:`For synchronous replication, the current implementation require that we have the same peer id for
both source and peer cluster. Another thing that need attention is: the peer does not support
cluster-level, namespace-level, or cf-level replication, only support table-level replication now.`})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Transit the peer cluster to be STANDBY state"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'STANDBY'"})]})})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Transit the source cluster to be ACTIVE state"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ACTIVE'"})]})})})}),`
`]}),`
`]}),`
`,e.jsx(s.p,{children:`Now, the synchronous replication has been set up successfully. the HBase client can only request to source cluster, if
request to peer cluster, the peer cluster which is STANDBY state now will reject the read/write requests.`}),`
`,e.jsx(s.h3,{id:"case2-how-to-operate-when-standby-cluster-crashed",children:"Case.2 How to operate when standby cluster crashed"}),`
`,e.jsx(s.p,{children:`If the standby cluster has been crashed, it will fail to write remote WAL for the active cluster. So we need to transit
the source cluster to DOWNGRANDE_ACTIVE state, which means source cluster won't write any remote WAL any more, but
the normal replication (asynchronous Replication) can still work fine, it queue the newly written WALs, but the
replication block until the peer cluster come back.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'DOWNGRADE_ACTIVE'"})]})})})}),`
`,e.jsx(s.p,{children:`Once the peer cluster come back, we can just transit the source cluster to ACTIVE, to ensure that the replication will be
synchronous.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ACTIVE'"})]})})})}),`
`,e.jsx(s.h3,{id:"case3-how-to-operate-when-active-cluster-crashed",children:"Case.3 How to operate when active cluster crashed"}),`
`,e.jsx(s.p,{children:`If the active cluster has been crashed (it may be not reachable now), so let's just transit the standby cluster to
DOWNGRADE_ACTIVE state, and after that, we should redirect all the requests from client to the DOWNGRADE_ACTIVE cluster.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'DOWNGRADE_ACTIVE'"})]})})})}),`
`,e.jsx(s.p,{children:`If the crashed cluster come back again, we just need to transit it to STANDBY directly. Otherwise if you transit the
cluster to DOWNGRADE_ACTIVE, the original ACTIVE cluster may have redundant data compared to the current ACTIVE
cluster. Because we designed to write source cluster WALs and remote cluster WALs concurrently, so it's possible that
the source cluster WALs has more data than the remote cluster, which result in data inconsistency. The procedure of
transiting ACTIVE to STANDBY has no problem, because we'll skip to replay the original WALs.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'STANDBY'"})]})})})}),`
`,e.jsx(s.p,{children:"After that, we can promote the DOWNGRADE_ACTIVE cluster to ACTIVE now, to ensure that the replication will be synchronous."}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transit_peer_sync_replication_state "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ACTIVE'"})]})})})})]})}function u(t={}){const{wrapper:s}=t.components||{};return s?e.jsx(s,{...t,children:e.jsx(n,{...t})}):n(t)}function r(t,s){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{a as _markdown,u as default,c as extractedReferences,l as frontmatter,o as structuredData,d as toc};
