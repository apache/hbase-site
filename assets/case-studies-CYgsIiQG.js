import{j as e}from"./components-BCHf_v1I.js";let a=`## Overview

This chapter will describe a variety of performance and troubleshooting case studies that can provide a useful blueprint on diagnosing Apache HBase cluster issues.

For more information on Performance and Troubleshooting, see [Apache HBase Performance Tuning](/docs/performance) and [Troubleshooting and Debugging Apache HBase](/docs/troubleshooting).

## Schema Design

See the schema design case studies here: [Schema Design Case Studies](/docs/regionserver-sizing#schema-design-case-studies)

## Performance/Troubleshooting

### Case Study #1 (Performance Issue On A Single Node)

#### Scenario

Following a scheduled reboot, one data node began exhibiting unusual behavior.
Routine MapReduce jobs run against HBase tables which regularly completed in five or six minutes began taking 30 or 40 minutes to finish.
These jobs were consistently found to be waiting on map and reduce tasks assigned to the troubled data node (e.g., the slow map tasks all had the same Input Split). The situation came to a head during a distributed copy, when the copy was severely prolonged by the lagging node.

#### Hardware

Datanodes:

* Two 12-core processors
* Six Enterprise SATA disks
* 24GB of RAM
* Two bonded gigabit NICs

Network:

* 10 Gigabit top-of-rack switches
* 20 Gigabit bonded interconnects between racks.

#### Hypotheses

**HBase "Hot Spot" Region**\\
We hypothesized that we were experiencing a familiar point of pain: a "hot spot" region in an HBase table, where uneven key-space distribution can funnel a huge number of requests to a single HBase region, bombarding the RegionServer process and cause slow response time.
Examination of the HBase Master status page showed that the number of HBase requests to the troubled node was almost zero.
Further, examination of the HBase logs showed that there were no region splits, compactions, or other region transitions in progress.
This effectively ruled out a "hot spot" as the root cause of the observed slowness.

**HBase Region With Non-Local Data**\\
Our next hypothesis was that one of the MapReduce tasks was requesting data from HBase that was not local to the DataNode, thus forcing HDFS to request data blocks from other servers over the network.
Examination of the DataNode logs showed that there were very few blocks being requested over the network, indicating that the HBase region was correctly assigned, and that the majority of the necessary data was located on the node.
This ruled out the possibility of non-local data causing a slowdown.

**Excessive I/O Wait Due To Swapping Or An Over-Worked Or Failing Hard Disk**\\
After concluding that the Hadoop and HBase were not likely to be the culprits, we moved on to troubleshooting the DataNode's hardware.
Java, by design, will periodically scan its entire memory space to do garbage collection.
If system memory is heavily overcommitted, the Linux kernel may enter a vicious cycle, using up all of its resources swapping Java heap back and forth from disk to RAM as Java tries to run garbage collection.
Further, a failing hard disk will often retry reads and/or writes many times before giving up and returning an error.
This can manifest as high iowait, as running processes wait for reads and writes to complete.
Finally, a disk nearing the upper edge of its performance envelope will begin to cause iowait as it informs the kernel that it cannot accept any more data, and the kernel queues incoming data into the dirty write pool in memory.
However, using \`vmstat(1)\` and \`free(1)\`, we could see that no swap was being used, and the amount of disk IO was only a few kilobytes per second.

**Slowness Due To High Processor Usage**\\
Next, we checked to see whether the system was performing slowly simply due to very high computational load. \`top(1)\` showed that the system load was higher than normal, but \`vmstat(1)\` and \`mpstat(1)\` showed that the amount of processor being used for actual computation was low.

**Network Saturation (The Winner)**\\
Since neither the disks nor the processors were being utilized heavily, we moved on to the performance of the network interfaces.
The DataNode had two gigabit ethernet adapters, bonded to form an active-standby interface. \`ifconfig(8)\` showed some unusual anomalies, namely interface errors, overruns, framing errors.
While not unheard of, these kinds of errors are exceedingly rare on modern hardware which is operating as it should:

\`\`\`bash
$ /sbin/ifconfig bond0
bond0  Link encap:Ethernet  HWaddr 00:00:00:00:00:00
inet addr:10.x.x.x  Bcast:10.x.x.255  Mask:255.255.255.0
UP BROADCAST RUNNING MASTER MULTICAST  MTU:1500  Metric:1
RX packets:2990700159 errors:12 dropped:0 overruns:1 frame:6          <--- Look Here! Errors!
TX packets:3443518196 errors:0 dropped:0 overruns:0 carrier:0
collisions:0 txqueuelen:0
RX bytes:2416328868676 (2.4 TB)  TX bytes:3464991094001 (3.4 TB)
\`\`\`

These errors immediately lead us to suspect that one or more of the ethernet interfaces might have negotiated the wrong line speed.
This was confirmed both by running an ICMP ping from an external host and observing round-trip-time in excess of 700ms, and by running \`ethtool(8)\` on the members of the bond interface and discovering that the active interface was operating at 100Mbs/, full duplex.

\`\`\`bash
$ sudo ethtool eth0
Settings for eth0:
Supported ports: [ TP ]
Supported link modes:   10baseT/Half 10baseT/Full
                       100baseT/Half 100baseT/Full
                       1000baseT/Full
Supports auto-negotiation: Yes
Advertised link modes:  10baseT/Half 10baseT/Full
                       100baseT/Half 100baseT/Full
                       1000baseT/Full
Advertised pause frame use: No
Advertised auto-negotiation: Yes
Link partner advertised link modes:  Not reported
Link partner advertised pause frame use: No
Link partner advertised auto-negotiation: No
Speed: 100Mb/s                                     <--- Look Here!  Should say 1000Mb/s!
Duplex: Full
Port: Twisted Pair
PHYAD: 1
Transceiver: internal
Auto-negotiation: on
MDI-X: Unknown
Supports Wake-on: umbg
Wake-on: g
Current message level: 0x00000003 (3)
Link detected: yes
\`\`\`

In normal operation, the ICMP ping round trip time should be around 20ms, and the interface speed and duplex should read, "1000MB/s", and, "Full", respectively.

#### Resolution

After determining that the active ethernet adapter was at the incorrect speed, we used the \`ifenslave(8)\` command to make the standby interface the active interface, which yielded an immediate improvement in MapReduce performance, and a 10 times improvement in network throughput:

On the next trip to the datacenter, we determined that the line speed issue was ultimately caused by a bad network cable, which was replaced.

### Case Study #2 (Performance Research 2012)

Investigation results of a self-described "we're not sure what's wrong, but it seems slow" problem. [http://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html](http://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html)

### Case Study #3 (Performance Research 2010)

Investigation results of general cluster performance from 2010.
Although this research is on an older version of the codebase, this writeup is still very useful in terms of approach. [https://web.archive.org/web/20180503124332/http://hstack.org/hbase-performance-testing/](https://web.archive.org/web/20180503124332/http://hstack.org/hbase-performance-testing/)

### Case Study #4 (max.transfer.threads Config)

Case study of configuring \`max.transfer.threads\` (previously known as \`xcievers\`) and diagnosing errors from misconfigurations. [http://www.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html](http://www.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html)

See also [\`dfs.datanode.max.transfer.threads\`](/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads).
`,r={title:"Apache HBase Case Studies",description:"Performance and troubleshooting case studies for diagnosing Apache HBase cluster issues."},h=[{href:"/docs/performance"},{href:"/docs/troubleshooting"},{href:"/docs/regionserver-sizing#schema-design-case-studies"},{href:"http://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html"},{href:"https://web.archive.org/web/20180503124332/http://hstack.org/hbase-performance-testing/"},{href:"http://www.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html"},{href:"/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads"}],o={contents:[{heading:"case-studies-overview",content:"This chapter will describe a variety of performance and troubleshooting case studies that can provide a useful blueprint on diagnosing Apache HBase cluster issues."},{heading:"case-studies-overview",content:"For more information on Performance and Troubleshooting, see Apache HBase Performance Tuning and Troubleshooting and Debugging Apache HBase."},{heading:"case-studies-schema-design",content:"See the schema design case studies here: Schema Design Case Studies"},{heading:"scenario",content:`Following a scheduled reboot, one data node began exhibiting unusual behavior.
Routine MapReduce jobs run against HBase tables which regularly completed in five or six minutes began taking 30 or 40 minutes to finish.
These jobs were consistently found to be waiting on map and reduce tasks assigned to the troubled data node (e.g., the slow map tasks all had the same Input Split). The situation came to a head during a distributed copy, when the copy was severely prolonged by the lagging node.`},{heading:"hardware",content:"Datanodes:"},{heading:"hardware",content:"Two 12-core processors"},{heading:"hardware",content:"Six Enterprise SATA disks"},{heading:"hardware",content:"24GB of RAM"},{heading:"hardware",content:"Two bonded gigabit NICs"},{heading:"hardware",content:"Network:"},{heading:"hardware",content:"10 Gigabit top-of-rack switches"},{heading:"hardware",content:"20 Gigabit bonded interconnects between racks."},{heading:"hypotheses",content:`**HBase "Hot Spot" Region**\\
We hypothesized that we were experiencing a familiar point of pain: a "hot spot" region in an HBase table, where uneven key-space distribution can funnel a huge number of requests to a single HBase region, bombarding the RegionServer process and cause slow response time.
Examination of the HBase Master status page showed that the number of HBase requests to the troubled node was almost zero.
Further, examination of the HBase logs showed that there were no region splits, compactions, or other region transitions in progress.
This effectively ruled out a "hot spot" as the root cause of the observed slowness.`},{heading:"hypotheses",content:`**HBase Region With Non-Local Data**\\
Our next hypothesis was that one of the MapReduce tasks was requesting data from HBase that was not local to the DataNode, thus forcing HDFS to request data blocks from other servers over the network.
Examination of the DataNode logs showed that there were very few blocks being requested over the network, indicating that the HBase region was correctly assigned, and that the majority of the necessary data was located on the node.
This ruled out the possibility of non-local data causing a slowdown.`},{heading:"hypotheses",content:`**Excessive I/O Wait Due To Swapping Or An Over-Worked Or Failing Hard Disk**\\
After concluding that the Hadoop and HBase were not likely to be the culprits, we moved on to troubleshooting the DataNode's hardware.
Java, by design, will periodically scan its entire memory space to do garbage collection.
If system memory is heavily overcommitted, the Linux kernel may enter a vicious cycle, using up all of its resources swapping Java heap back and forth from disk to RAM as Java tries to run garbage collection.
Further, a failing hard disk will often retry reads and/or writes many times before giving up and returning an error.
This can manifest as high iowait, as running processes wait for reads and writes to complete.
Finally, a disk nearing the upper edge of its performance envelope will begin to cause iowait as it informs the kernel that it cannot accept any more data, and the kernel queues incoming data into the dirty write pool in memory.
However, using \`vmstat(1)\` and \`free(1)\`, we could see that no swap was being used, and the amount of disk IO was only a few kilobytes per second.`},{heading:"hypotheses",content:"**Slowness Due To High Processor Usage**\\\nNext, we checked to see whether the system was performing slowly simply due to very high computational load. `top(1)` showed that the system load was higher than normal, but `vmstat(1)` and `mpstat(1)` showed that the amount of processor being used for actual computation was low."},{heading:"hypotheses",content:`**Network Saturation (The Winner)**\\
Since neither the disks nor the processors were being utilized heavily, we moved on to the performance of the network interfaces.
The DataNode had two gigabit ethernet adapters, bonded to form an active-standby interface. \`ifconfig(8)\` showed some unusual anomalies, namely interface errors, overruns, framing errors.
While not unheard of, these kinds of errors are exceedingly rare on modern hardware which is operating as it should:`},{heading:"hypotheses",content:"These errors immediately lead us to suspect that one or more of the ethernet interfaces might have negotiated the wrong line speed.\nThis was confirmed both by running an ICMP ping from an external host and observing round-trip-time in excess of 700ms, and by running `ethtool(8)` on the members of the bond interface and discovering that the active interface was operating at 100Mbs/, full duplex."},{heading:"hypotheses",content:'In normal operation, the ICMP ping round trip time should be around 20ms, and the interface speed and duplex should read, "1000MB/s", and, "Full", respectively.'},{heading:"resolution",content:"After determining that the active ethernet adapter was at the incorrect speed, we used the `ifenslave(8)` command to make the standby interface the active interface, which yielded an immediate improvement in MapReduce performance, and a 10 times improvement in network throughput:"},{heading:"resolution",content:"On the next trip to the datacenter, we determined that the line speed issue was ultimately caused by a bad network cable, which was replaced."},{heading:"case-study-2-performance-research-2012",content:`Investigation results of a self-described "we're not sure what's wrong, but it seems slow" problem. http\\://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html`},{heading:"case-study-3-performance-research-2010",content:`Investigation results of general cluster performance from 2010.
Although this research is on an older version of the codebase, this writeup is still very useful in terms of approach. https\\://web.archive.org/web/20180503124332/http\\://hstack.org/hbase-performance-testing/`},{heading:"case-study-4-maxtransferthreads-config",content:"Case study of configuring `max.transfer.threads` (previously known as `xcievers`) and diagnosing errors from misconfigurations. http\\://www\\.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html"},{heading:"case-study-4-maxtransferthreads-config",content:"See also `dfs.datanode.max.transfer.threads`."}],headings:[{id:"case-studies-overview",content:"Overview"},{id:"case-studies-schema-design",content:"Schema Design"},{id:"performancetroubleshooting",content:"Performance/Troubleshooting"},{id:"case-study-1-performance-issue-on-a-single-node",content:"Case Study #1 (Performance Issue On A Single Node)"},{id:"scenario",content:"Scenario"},{id:"hardware",content:"Hardware"},{id:"hypotheses",content:"Hypotheses"},{id:"resolution",content:"Resolution"},{id:"case-study-2-performance-research-2012",content:"Case Study #2 (Performance Research 2012)"},{id:"case-study-3-performance-research-2010",content:"Case Study #3 (Performance Research 2010)"},{id:"case-study-4-maxtransferthreads-config",content:"Case Study #4 (max.transfer.threads Config)"}]},d=[{depth:2,url:"#case-studies-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:2,url:"#case-studies-schema-design",title:e.jsx(e.Fragment,{children:"Schema Design"})},{depth:2,url:"#performancetroubleshooting",title:e.jsx(e.Fragment,{children:"Performance/Troubleshooting"})},{depth:3,url:"#case-study-1-performance-issue-on-a-single-node",title:e.jsx(e.Fragment,{children:"Case Study #1 (Performance Issue On A Single Node)"})},{depth:4,url:"#scenario",title:e.jsx(e.Fragment,{children:"Scenario"})},{depth:4,url:"#hardware",title:e.jsx(e.Fragment,{children:"Hardware"})},{depth:4,url:"#hypotheses",title:e.jsx(e.Fragment,{children:"Hypotheses"})},{depth:4,url:"#resolution",title:e.jsx(e.Fragment,{children:"Resolution"})},{depth:3,url:"#case-study-2-performance-research-2012",title:e.jsx(e.Fragment,{children:"Case Study #2 (Performance Research 2012)"})},{depth:3,url:"#case-study-3-performance-research-2010",title:e.jsx(e.Fragment,{children:"Case Study #3 (Performance Research 2010)"})},{depth:3,url:"#case-study-4-maxtransferthreads-config",title:e.jsx(e.Fragment,{children:"Case Study #4 (max.transfer.threads Config)"})}];function n(i){const s={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"case-studies-overview",children:"Overview"}),`
`,e.jsx(s.p,{children:"This chapter will describe a variety of performance and troubleshooting case studies that can provide a useful blueprint on diagnosing Apache HBase cluster issues."}),`
`,e.jsxs(s.p,{children:["For more information on Performance and Troubleshooting, see ",e.jsx(s.a,{href:"/docs/performance",children:"Apache HBase Performance Tuning"})," and ",e.jsx(s.a,{href:"/docs/troubleshooting",children:"Troubleshooting and Debugging Apache HBase"}),"."]}),`
`,e.jsx(s.h2,{id:"case-studies-schema-design",children:"Schema Design"}),`
`,e.jsxs(s.p,{children:["See the schema design case studies here: ",e.jsx(s.a,{href:"/docs/regionserver-sizing#schema-design-case-studies",children:"Schema Design Case Studies"})]}),`
`,e.jsx(s.h2,{id:"performancetroubleshooting",children:"Performance/Troubleshooting"}),`
`,e.jsx(s.h3,{id:"case-study-1-performance-issue-on-a-single-node",children:"Case Study #1 (Performance Issue On A Single Node)"}),`
`,e.jsx(s.h4,{id:"scenario",children:"Scenario"}),`
`,e.jsx(s.p,{children:`Following a scheduled reboot, one data node began exhibiting unusual behavior.
Routine MapReduce jobs run against HBase tables which regularly completed in five or six minutes began taking 30 or 40 minutes to finish.
These jobs were consistently found to be waiting on map and reduce tasks assigned to the troubled data node (e.g., the slow map tasks all had the same Input Split). The situation came to a head during a distributed copy, when the copy was severely prolonged by the lagging node.`}),`
`,e.jsx(s.h4,{id:"hardware",children:"Hardware"}),`
`,e.jsx(s.p,{children:"Datanodes:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Two 12-core processors"}),`
`,e.jsx(s.li,{children:"Six Enterprise SATA disks"}),`
`,e.jsx(s.li,{children:"24GB of RAM"}),`
`,e.jsx(s.li,{children:"Two bonded gigabit NICs"}),`
`]}),`
`,e.jsx(s.p,{children:"Network:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"10 Gigabit top-of-rack switches"}),`
`,e.jsx(s.li,{children:"20 Gigabit bonded interconnects between racks."}),`
`]}),`
`,e.jsx(s.h4,{id:"hypotheses",children:"Hypotheses"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:'HBase "Hot Spot" Region'}),e.jsx(s.br,{}),`
`,`We hypothesized that we were experiencing a familiar point of pain: a "hot spot" region in an HBase table, where uneven key-space distribution can funnel a huge number of requests to a single HBase region, bombarding the RegionServer process and cause slow response time.
Examination of the HBase Master status page showed that the number of HBase requests to the troubled node was almost zero.
Further, examination of the HBase logs showed that there were no region splits, compactions, or other region transitions in progress.
This effectively ruled out a "hot spot" as the root cause of the observed slowness.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"HBase Region With Non-Local Data"}),e.jsx(s.br,{}),`
`,`Our next hypothesis was that one of the MapReduce tasks was requesting data from HBase that was not local to the DataNode, thus forcing HDFS to request data blocks from other servers over the network.
Examination of the DataNode logs showed that there were very few blocks being requested over the network, indicating that the HBase region was correctly assigned, and that the majority of the necessary data was located on the node.
This ruled out the possibility of non-local data causing a slowdown.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Excessive I/O Wait Due To Swapping Or An Over-Worked Or Failing Hard Disk"}),e.jsx(s.br,{}),`
`,`After concluding that the Hadoop and HBase were not likely to be the culprits, we moved on to troubleshooting the DataNode's hardware.
Java, by design, will periodically scan its entire memory space to do garbage collection.
If system memory is heavily overcommitted, the Linux kernel may enter a vicious cycle, using up all of its resources swapping Java heap back and forth from disk to RAM as Java tries to run garbage collection.
Further, a failing hard disk will often retry reads and/or writes many times before giving up and returning an error.
This can manifest as high iowait, as running processes wait for reads and writes to complete.
Finally, a disk nearing the upper edge of its performance envelope will begin to cause iowait as it informs the kernel that it cannot accept any more data, and the kernel queues incoming data into the dirty write pool in memory.
However, using `,e.jsx(s.code,{children:"vmstat(1)"})," and ",e.jsx(s.code,{children:"free(1)"}),", we could see that no swap was being used, and the amount of disk IO was only a few kilobytes per second."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Slowness Due To High Processor Usage"}),e.jsx(s.br,{}),`
`,"Next, we checked to see whether the system was performing slowly simply due to very high computational load. ",e.jsx(s.code,{children:"top(1)"})," showed that the system load was higher than normal, but ",e.jsx(s.code,{children:"vmstat(1)"})," and ",e.jsx(s.code,{children:"mpstat(1)"})," showed that the amount of processor being used for actual computation was low."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Network Saturation (The Winner)"}),e.jsx(s.br,{}),`
`,`Since neither the disks nor the processors were being utilized heavily, we moved on to the performance of the network interfaces.
The DataNode had two gigabit ethernet adapters, bonded to form an active-standby interface. `,e.jsx(s.code,{children:"ifconfig(8)"}),` showed some unusual anomalies, namely interface errors, overruns, framing errors.
While not unheard of, these kinds of errors are exceedingly rare on modern hardware which is operating as it should:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /sbin/ifconfig"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bond0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bond0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" encap:Ethernet"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  HWaddr"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 00:00:00:00:00:00"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"inet"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" addr:10.x.x.x"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Bcast:10.x.x.255"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Mask:255.255.255.0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"UP"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" BROADCAST"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" RUNNING"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MASTER"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MULTICAST"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  MTU:1500"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Metric:1"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"RX"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" packets:2990700159"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" errors:12"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dropped:0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" overruns:1"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" frame:6"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"---"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Look"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Here!"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Errors!"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TX"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" packets:3443518196"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" errors:0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dropped:0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" overruns:0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" carrier:0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collisions:0"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" txqueuelen:0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"RX"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bytes:2416328868676"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (2.4 "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"TB"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")  TX bytes:3464991094001 ("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"3.4"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TB"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(s.p,{children:[`These errors immediately lead us to suspect that one or more of the ethernet interfaces might have negotiated the wrong line speed.
This was confirmed both by running an ICMP ping from an external host and observing round-trip-time in excess of 700ms, and by running `,e.jsx(s.code,{children:"ethtool(8)"})," on the members of the bond interface and discovering that the active interface was operating at 100Mbs/, full duplex."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sudo"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ethtool"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" eth0"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Settings"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" eth0:"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Supported"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ports:"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [ "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"TP"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ]"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Supported"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" modes:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"   10baseT/Half"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 10baseT/Full"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                       100baseT/Half"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100baseT/Full"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                       1000baseT/Full"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Supports"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auto-negotiation:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Yes"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" modes:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  10baseT/Half"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 10baseT/Full"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                       100baseT/Half"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100baseT/Full"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                       1000baseT/Full"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pause"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" frame"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" No"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auto-negotiation:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Yes"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" partner"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" modes:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Not"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reported"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" partner"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pause"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" frame"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" No"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" partner"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" advertised"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auto-negotiation:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" No"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Speed:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100Mb/s"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                     <"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"---"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Look"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Here!"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Should"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" say"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 1000Mb/s!"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Duplex:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Full"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Port:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Twisted"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Pair"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PHYAD:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Transceiver:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" internal"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Auto-negotiation:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MDI-X:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Unknown"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Supports"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Wake-on:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" umbg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Wake-on:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" g"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Current"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" message"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" level:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x00000003"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (3)"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Link"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" detected:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" yes"})]})]})})}),`
`,e.jsx(s.p,{children:'In normal operation, the ICMP ping round trip time should be around 20ms, and the interface speed and duplex should read, "1000MB/s", and, "Full", respectively.'}),`
`,e.jsx(s.h4,{id:"resolution",children:"Resolution"}),`
`,e.jsxs(s.p,{children:["After determining that the active ethernet adapter was at the incorrect speed, we used the ",e.jsx(s.code,{children:"ifenslave(8)"})," command to make the standby interface the active interface, which yielded an immediate improvement in MapReduce performance, and a 10 times improvement in network throughput:"]}),`
`,e.jsx(s.p,{children:"On the next trip to the datacenter, we determined that the line speed issue was ultimately caused by a bad network cable, which was replaced."}),`
`,e.jsx(s.h3,{id:"case-study-2-performance-research-2012",children:"Case Study #2 (Performance Research 2012)"}),`
`,e.jsxs(s.p,{children:[`Investigation results of a self-described "we're not sure what's wrong, but it seems slow" problem. `,e.jsx(s.a,{href:"http://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html",children:"http://gbif.blogspot.com/2012/03/hbase-performance-evaluation-continued.html"})]}),`
`,e.jsx(s.h3,{id:"case-study-3-performance-research-2010",children:"Case Study #3 (Performance Research 2010)"}),`
`,e.jsxs(s.p,{children:[`Investigation results of general cluster performance from 2010.
Although this research is on an older version of the codebase, this writeup is still very useful in terms of approach. `,e.jsx(s.a,{href:"https://web.archive.org/web/20180503124332/http://hstack.org/hbase-performance-testing/",children:"https://web.archive.org/web/20180503124332/http://hstack.org/hbase-performance-testing/"})]}),`
`,e.jsx(s.h3,{id:"case-study-4-maxtransferthreads-config",children:"Case Study #4 (max.transfer.threads Config)"}),`
`,e.jsxs(s.p,{children:["Case study of configuring ",e.jsx(s.code,{children:"max.transfer.threads"})," (previously known as ",e.jsx(s.code,{children:"xcievers"}),") and diagnosing errors from misconfigurations. ",e.jsx(s.a,{href:"http://www.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html",children:"http://www.larsgeorge.com/2012/03/hadoop-hbase-and-xceivers.html"})]}),`
`,e.jsxs(s.p,{children:["See also ",e.jsx(s.a,{href:"/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads",children:e.jsx(s.code,{children:"dfs.datanode.max.transfer.threads"})}),"."]})]})}function l(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{a as _markdown,l as default,h as extractedReferences,r as frontmatter,o as structuredData,d as toc};
