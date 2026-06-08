import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let l=`## Basic Distributed HBase Install

Here is a basic configuration example for a distributed ten node cluster: \\* The nodes are named \`example0\`, \`example1\`, etc., through node \`example9\` in this example. \\* The HBase Master and the HDFS NameNode are running on the node \`example0\`. \\* RegionServers run on nodes \`example1\`-\`example9\`. \\* A 3-node ZooKeeper ensemble runs on \`example1\`, \`example2\`, and \`example3\` on the default ports. \\* ZooKeeper data is persisted to the directory */export/zookeeper*.

Below we show what the main configuration files — *hbase-site.xml*, *regionservers*, and *hbase-env.sh* — found in the HBase *conf* directory might look like.

### hbase-site.xml

\`\`\`xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>example1,example2,example3</value>
    <description>The directory shared by RegionServers.</description>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/export/zookeeper</value>
    <description>Property from ZooKeeper config zoo.cfg.
      The directory where the snapshot is stored.
    </description>
  </property>
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://example0:9000/hbase</value>
    <description>The directory shared by RegionServers.</description>
  </property>
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
    <description>The mode the cluster will be in. Possible values are
      false: standalone and pseudo-distributed setups with managed ZooKeeper
      true: fully-distributed with unmanaged ZooKeeper Quorum (see hbase-env.sh)
    </description>
  </property>
</configuration>
\`\`\`

### *regionservers*

In this file you list the nodes that will run RegionServers. In our case, these nodes are \`example1\`-\`example9\`.

\`\`\`text
example1
example2
example3
example4
example5
example6
example7
example8
example9
\`\`\`

### hbase-env.sh

The following lines in the *hbase-env.sh* file show how to set the \`JAVA_HOME\` environment variable (required for HBase) and set the heap to 4 GB (rather than the default value of 1 GB). If you copy and paste this example, be sure to adjust the \`JAVA_HOME\` to suit your environment.

\`\`\`bash
# The java implementation to use.
export JAVA_HOME=/usr/java/jdk1.8.0/

# The maximum amount of heap to use. Default is left to JVM default.
export HBASE_HEAPSIZE=4G
\`\`\`

Use rsync to copy the content of the *conf* directory to all nodes of the cluster.
`,a={title:"Example Configurations",description:"Sample configuration files and setup examples for distributed HBase clusters."},r=[],t={contents:[{heading:"basic-distributed-hbase-install",content:"Here is a basic configuration example for a distributed ten node cluster: * The nodes are named example0, example1, etc., through node example9 in this example. * The HBase Master and the HDFS NameNode are running on the node example0. * RegionServers run on nodes example1-example9. * A 3-node ZooKeeper ensemble runs on example1, example2, and example3 on the default ports. * ZooKeeper data is persisted to the directory /export/zookeeper."},{heading:"basic-distributed-hbase-install",content:"Below we show what the main configuration files — hbase-site.xml, regionservers, and hbase-env.sh — found in the HBase conf directory might look like."},{heading:"regionservers",content:"In this file you list the nodes that will run RegionServers. In our case, these nodes are example1-example9."},{heading:"configuration-example-basic-distributed-hbase-install-hbase-env-sh",content:"The following lines in the hbase-env.sh file show how to set the JAVA_HOME environment variable (required for HBase) and set the heap to 4 GB (rather than the default value of 1 GB). If you copy and paste this example, be sure to adjust the JAVA_HOME to suit your environment."},{heading:"configuration-example-basic-distributed-hbase-install-hbase-env-sh",content:"Use rsync to copy the content of the conf directory to all nodes of the cluster."}],headings:[{id:"basic-distributed-hbase-install",content:"Basic Distributed HBase Install"},{id:"hbase-sitexml",content:"hbase-site.xml"},{id:"regionservers",content:"regionservers"},{id:"configuration-example-basic-distributed-hbase-install-hbase-env-sh",content:"hbase-env.sh"}]};const d=[{depth:2,url:"#basic-distributed-hbase-install",title:e.jsx(e.Fragment,{children:"Basic Distributed HBase Install"})},{depth:3,url:"#hbase-sitexml",title:e.jsx(e.Fragment,{children:"hbase-site.xml"})},{depth:3,url:"#regionservers",title:e.jsx(e.Fragment,{children:e.jsx("em",{children:"regionservers"})})},{depth:3,url:"#configuration-example-basic-distributed-hbase-install-hbase-env-sh",title:e.jsx(e.Fragment,{children:"hbase-env.sh"})}];function n(i){const s={code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"basic-distributed-hbase-install",children:"Basic Distributed HBase Install"}),`
`,e.jsxs(s.p,{children:["Here is a basic configuration example for a distributed ten node cluster: * The nodes are named ",e.jsx(s.code,{children:"example0"}),", ",e.jsx(s.code,{children:"example1"}),", etc., through node ",e.jsx(s.code,{children:"example9"})," in this example. * The HBase Master and the HDFS NameNode are running on the node ",e.jsx(s.code,{children:"example0"}),". * RegionServers run on nodes ",e.jsx(s.code,{children:"example1"}),"-",e.jsx(s.code,{children:"example9"}),". * A 3-node ZooKeeper ensemble runs on ",e.jsx(s.code,{children:"example1"}),", ",e.jsx(s.code,{children:"example2"}),", and ",e.jsx(s.code,{children:"example3"})," on the default ports. * ZooKeeper data is persisted to the directory ",e.jsx(s.em,{children:"/export/zookeeper"}),"."]}),`
`,e.jsxs(s.p,{children:["Below we show what the main configuration files — ",e.jsx(s.em,{children:"hbase-site.xml"}),", ",e.jsx(s.em,{children:"regionservers"}),", and ",e.jsx(s.em,{children:"hbase-env.sh"})," — found in the HBase ",e.jsx(s.em,{children:"conf"})," directory might look like."]}),`
`,e.jsx(s.h3,{id:"hbase-sitexml",children:"hbase-site.xml"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" version"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1.0"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml-stylesheet"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text/xsl"'}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" href"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"configuration.xsl"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.zookeeper.quorum</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">example1,example2,example3</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">The directory shared by RegionServers.</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.zookeeper.property.dataDir</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">/export/zookeeper</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Property from ZooKeeper config zoo.cfg."})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      The directory where the snapshot is stored."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.rootdir</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hdfs://example0:9000/hbase</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">The directory shared by RegionServers.</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.cluster.distributed</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">true</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">The mode the cluster will be in. Possible values are"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      false: standalone and pseudo-distributed setups with managed ZooKeeper"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      true: fully-distributed with unmanaged ZooKeeper Quorum (see hbase-env.sh)"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(s.h3,{id:"regionservers",children:e.jsx(s.em,{children:"regionservers"})}),`
`,e.jsxs(s.p,{children:["In this file you list the nodes that will run RegionServers. In our case, these nodes are ",e.jsx(s.code,{children:"example1"}),"-",e.jsx(s.code,{children:"example9"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example2"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example3"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example4"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example5"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example6"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example7"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example8"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"example9"})})]})})}),`
`,e.jsx(s.h3,{id:"configuration-example-basic-distributed-hbase-install-hbase-env-sh",children:"hbase-env.sh"}),`
`,e.jsxs(s.p,{children:["The following lines in the ",e.jsx(s.em,{children:"hbase-env.sh"})," file show how to set the ",e.jsx(s.code,{children:"JAVA_HOME"})," environment variable (required for HBase) and set the heap to 4 GB (rather than the default value of 1 GB). If you copy and paste this example, be sure to adjust the ",e.jsx(s.code,{children:"JAVA_HOME"})," to suit your environment."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# The java implementation to use."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" JAVA_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/usr/java/jdk1.8.0/"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# The maximum amount of heap to use. Default is left to JVM default."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBASE_HEAPSIZE"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"4G"})]})]})})}),`
`,e.jsxs(s.p,{children:["Use rsync to copy the content of the ",e.jsx(s.em,{children:"conf"})," directory to all nodes of the cluster."]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{l as _markdown,c as default,r as extractedReferences,a as frontmatter,t as structuredData,d as toc};
