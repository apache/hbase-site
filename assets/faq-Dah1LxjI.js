import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let t=`## General

#### When should I use HBase?

See [Overview](/docs/architecture/overview) in the Architecture chapter.

#### Does HBase support SQL?

Not really. SQL-ish support for HBase via [Hive](https://hive.apache.org/) is in development, however Hive is based on MapReduce which is not generally suitable for low-latency requests. See the [Data Model](/docs/datamodel) section for examples on the HBase client.

#### How can I find examples of NoSQL/HBase?

See the link to the BigTable paper in [Other Information About HBase](/docs/other-info), as well as the other papers.

#### What is the history of HBase?

See [HBase History](/docs/hbase-history).

#### Why are the cells above 10MB not recommended for HBase?

Large cells don't fit well into HBase's approach to buffering data. First, the large cells bypass the MemStoreLAB when they are written. Then, they cannot be cached in the L2 block cache during read operations. Instead, HBase has to allocate on-heap memory for them each time. This can have a significant impact on the garbage collector within the RegionServer process.

## Upgrading

#### How do I upgrade Maven-managed projects from HBase 0.94 to HBase 0.96+?

In HBase 0.96, the project moved to a modular structure. Adjust your project's dependencies to rely upon the \`hbase-client\` module or another module as appropriate, rather than a single JAR. You can model your Maven dependency after one of the following, depending on your targeted version of HBase. See Section 3.5, "Upgrading from 0.94.x to 0.96.x" or Section 3.3, "Upgrading from 0.96.x to 0.98.x" for more information.

**Maven Dependency for HBase 0.98**

\`\`\`xml
<dependency>
  <groupId>org.apache.hbase</groupId>
  <artifactId>hbase-client</artifactId>
  <version>0.98.5-hadoop2</version>
</dependency>
\`\`\`

**Maven Dependency for HBase 0.96**

\`\`\`xml
<dependency>
  <groupId>org.apache.hbase</groupId>
  <artifactId>hbase-client</artifactId>
  <version>0.96.2-hadoop2</version>
</dependency>
\`\`\`

**Maven Dependency for HBase 0.94**

\`\`\`xml
<dependency>
  <groupId>org.apache.hbase</groupId>
  <artifactId>hbase</artifactId>
  <version>0.94.3</version>
</dependency>
\`\`\`

## Architecture

#### How does HBase handle Region-RegionServer assignment and locality?

See [Regions](/docs/architecture/regions).

## Configuration

#### How can I get started with my first cluster?

See [Quick Start - Standalone HBase](/docs/getting-started#quick-start---standalone-hbase).

#### Where can I learn about the rest of the configuration options?

See [Apache HBase Configuration](/docs/configuration).

## Schema Design / Data Access

#### How should I design my schema in HBase?

See [Data Model](/docs/datamodel) and [HBase and Schema Design](/docs/schema-design).

#### How can I store (fill in the blank) in HBase?

See [Supported Datatypes](/docs/regionserver-sizing#supported-datatypes).

#### How can I handle secondary indexes in HBase?

See [Secondary Indexes and Alternate Query Paths](/docs/regionserver-sizing#secondary-indexes-and-alternate-query-paths).

#### Can I change a table's rowkeys?

This is a very common question. You can't. See [Immutability of Rowkeys](/docs/regionserver-sizing#immutability-of-rowkeys).

#### What APIs does HBase support?

See [Data Model](/docs/datamodel), [Client](/docs/architecture/client), and [Apache HBase External APIs](/docs/external-apis).

## MapReduce

#### How can I use MapReduce with HBase?

See [HBase and MapReduce](/docs/mapreduce).

## Performance and Troubleshooting

#### How can I improve HBase cluster performance?

See [Apache HBase Performance Tuning](/docs/performance).

#### How can I troubleshoot my HBase cluster?

See [Troubleshooting and Debugging Apache HBase](/docs/troubleshooting).

## Amazon EC2

#### I am running HBase on Amazon EC2 and...

EC2 issues are a special case. See [Amazon EC2](/docs/troubleshooting#troubleshooting-amazon-ec2) and [Amazon EC2](/docs/performance#performance-amazon-ec2).

## Operations

#### How do I manage my HBase cluster?

See [Apache HBase Operational Management](/docs/operational-management).

#### How do I back up my HBase cluster?

See [HBase Backup](/docs/operational-management/backup-and-snapshots#hbase-backup).

## HBase in Action

#### Where can I find interesting videos and presentations on HBase?

See [Other Information About HBase](/docs/other-info).
`,r={title:"FAQ",description:"Frequently asked questions about Apache HBase."},o=[{href:"/docs/architecture/overview"},{href:"https://hive.apache.org/"},{href:"/docs/datamodel"},{href:"/docs/other-info"},{href:"/docs/hbase-history"},{href:"/docs/architecture/regions"},{href:"/docs/getting-started#quick-start---standalone-hbase"},{href:"/docs/configuration"},{href:"/docs/datamodel"},{href:"/docs/schema-design"},{href:"/docs/regionserver-sizing#supported-datatypes"},{href:"/docs/regionserver-sizing#secondary-indexes-and-alternate-query-paths"},{href:"/docs/regionserver-sizing#immutability-of-rowkeys"},{href:"/docs/datamodel"},{href:"/docs/architecture/client"},{href:"/docs/external-apis"},{href:"/docs/mapreduce"},{href:"/docs/performance"},{href:"/docs/troubleshooting"},{href:"/docs/troubleshooting#troubleshooting-amazon-ec2"},{href:"/docs/performance#performance-amazon-ec2"},{href:"/docs/operational-management"},{href:"/docs/operational-management/backup-and-snapshots#hbase-backup"},{href:"/docs/other-info"}],h={contents:[{heading:"faq-when-should-i-use-hbase",content:"See Overview in the Architecture chapter."},{heading:"does-hbase-support-sql",content:"Not really. SQL-ish support for HBase via Hive is in development, however Hive is based on MapReduce which is not generally suitable for low-latency requests. See the Data Model section for examples on the HBase client."},{heading:"how-can-i-find-examples-of-nosqlhbase",content:"See the link to the BigTable paper in Other Information About HBase, as well as the other papers."},{heading:"what-is-the-history-of-hbase",content:"See HBase History."},{heading:"why-are-the-cells-above-10mb-not-recommended-for-hbase",content:"Large cells don't fit well into HBase's approach to buffering data. First, the large cells bypass the MemStoreLAB when they are written. Then, they cannot be cached in the L2 block cache during read operations. Instead, HBase has to allocate on-heap memory for them each time. This can have a significant impact on the garbage collector within the RegionServer process."},{heading:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",content:`In HBase 0.96, the project moved to a modular structure. Adjust your project's dependencies to rely upon the hbase-client module or another module as appropriate, rather than a single JAR. You can model your Maven dependency after one of the following, depending on your targeted version of HBase. See Section 3.5, "Upgrading from 0.94.x to 0.96.x" or Section 3.3, "Upgrading from 0.96.x to 0.98.x" for more information.`},{heading:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",content:"Maven Dependency for HBase 0.98"},{heading:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",content:"Maven Dependency for HBase 0.96"},{heading:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",content:"Maven Dependency for HBase 0.94"},{heading:"how-does-hbase-handle-region-regionserver-assignment-and-locality",content:"See Regions."},{heading:"how-can-i-get-started-with-my-first-cluster",content:"See Quick Start - Standalone HBase."},{heading:"where-can-i-learn-about-the-rest-of-the-configuration-options",content:"See Apache HBase Configuration."},{heading:"how-should-i-design-my-schema-in-hbase",content:"See Data Model and HBase and Schema Design."},{heading:"how-can-i-store-fill-in-the-blank-in-hbase",content:"See Supported Datatypes."},{heading:"how-can-i-handle-secondary-indexes-in-hbase",content:"See Secondary Indexes and Alternate Query Paths."},{heading:"can-i-change-a-tables-rowkeys",content:"This is a very common question. You can't. See Immutability of Rowkeys."},{heading:"what-apis-does-hbase-support",content:"See Data Model, Client, and Apache HBase External APIs."},{heading:"how-can-i-use-mapreduce-with-hbase",content:"See HBase and MapReduce."},{heading:"how-can-i-improve-hbase-cluster-performance",content:"See Apache HBase Performance Tuning."},{heading:"how-can-i-troubleshoot-my-hbase-cluster",content:"See Troubleshooting and Debugging Apache HBase."},{heading:"i-am-running-hbase-on-amazon-ec2-and",content:"EC2 issues are a special case. See Amazon EC2 and Amazon EC2."},{heading:"how-do-i-manage-my-hbase-cluster",content:"See Apache HBase Operational Management."},{heading:"how-do-i-back-up-my-hbase-cluster",content:"See HBase Backup."},{heading:"where-can-i-find-interesting-videos-and-presentations-on-hbase",content:"See Other Information About HBase."}],headings:[{id:"general",content:"General"},{id:"faq-when-should-i-use-hbase",content:"When should I use HBase?"},{id:"does-hbase-support-sql",content:"Does HBase support SQL?"},{id:"how-can-i-find-examples-of-nosqlhbase",content:"How can I find examples of NoSQL/HBase?"},{id:"what-is-the-history-of-hbase",content:"What is the history of HBase?"},{id:"why-are-the-cells-above-10mb-not-recommended-for-hbase",content:"Why are the cells above 10MB not recommended for HBase?"},{id:"faq-upgrading",content:"Upgrading"},{id:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",content:"How do I upgrade Maven-managed projects from HBase 0.94 to HBase 0.96+?"},{id:"faq-architecture",content:"Architecture"},{id:"how-does-hbase-handle-region-regionserver-assignment-and-locality",content:"How does HBase handle Region-RegionServer assignment and locality?"},{id:"faq-configuration",content:"Configuration"},{id:"how-can-i-get-started-with-my-first-cluster",content:"How can I get started with my first cluster?"},{id:"where-can-i-learn-about-the-rest-of-the-configuration-options",content:"Where can I learn about the rest of the configuration options?"},{id:"schema-design--data-access",content:"Schema Design / Data Access"},{id:"how-should-i-design-my-schema-in-hbase",content:"How should I design my schema in HBase?"},{id:"how-can-i-store-fill-in-the-blank-in-hbase",content:"How can I store (fill in the blank) in HBase?"},{id:"how-can-i-handle-secondary-indexes-in-hbase",content:"How can I handle secondary indexes in HBase?"},{id:"can-i-change-a-tables-rowkeys",content:"Can I change a table's rowkeys?"},{id:"what-apis-does-hbase-support",content:"What APIs does HBase support?"},{id:"faq-mapreduce",content:"MapReduce"},{id:"how-can-i-use-mapreduce-with-hbase",content:"How can I use MapReduce with HBase?"},{id:"performance-and-troubleshooting",content:"Performance and Troubleshooting"},{id:"how-can-i-improve-hbase-cluster-performance",content:"How can I improve HBase cluster performance?"},{id:"how-can-i-troubleshoot-my-hbase-cluster",content:"How can I troubleshoot my HBase cluster?"},{id:"faq-amazon-ec2",content:"Amazon EC2"},{id:"i-am-running-hbase-on-amazon-ec2-and",content:"I am running HBase on Amazon EC2 and..."},{id:"operations",content:"Operations"},{id:"how-do-i-manage-my-hbase-cluster",content:"How do I manage my HBase cluster?"},{id:"how-do-i-back-up-my-hbase-cluster",content:"How do I back up my HBase cluster?"},{id:"hbase-in-action",content:"HBase in Action"},{id:"where-can-i-find-interesting-videos-and-presentations-on-hbase",content:"Where can I find interesting videos and presentations on HBase?"}]};const d=[{depth:2,url:"#general",title:e.jsx(e.Fragment,{children:"General"})},{depth:4,url:"#faq-when-should-i-use-hbase",title:e.jsx(e.Fragment,{children:"When should I use HBase?"})},{depth:4,url:"#does-hbase-support-sql",title:e.jsx(e.Fragment,{children:"Does HBase support SQL?"})},{depth:4,url:"#how-can-i-find-examples-of-nosqlhbase",title:e.jsx(e.Fragment,{children:"How can I find examples of NoSQL/HBase?"})},{depth:4,url:"#what-is-the-history-of-hbase",title:e.jsx(e.Fragment,{children:"What is the history of HBase?"})},{depth:4,url:"#why-are-the-cells-above-10mb-not-recommended-for-hbase",title:e.jsx(e.Fragment,{children:"Why are the cells above 10MB not recommended for HBase?"})},{depth:2,url:"#faq-upgrading",title:e.jsx(e.Fragment,{children:"Upgrading"})},{depth:4,url:"#how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",title:e.jsx(e.Fragment,{children:"How do I upgrade Maven-managed projects from HBase 0.94 to HBase 0.96+?"})},{depth:2,url:"#faq-architecture",title:e.jsx(e.Fragment,{children:"Architecture"})},{depth:4,url:"#how-does-hbase-handle-region-regionserver-assignment-and-locality",title:e.jsx(e.Fragment,{children:"How does HBase handle Region-RegionServer assignment and locality?"})},{depth:2,url:"#faq-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:4,url:"#how-can-i-get-started-with-my-first-cluster",title:e.jsx(e.Fragment,{children:"How can I get started with my first cluster?"})},{depth:4,url:"#where-can-i-learn-about-the-rest-of-the-configuration-options",title:e.jsx(e.Fragment,{children:"Where can I learn about the rest of the configuration options?"})},{depth:2,url:"#schema-design--data-access",title:e.jsx(e.Fragment,{children:"Schema Design / Data Access"})},{depth:4,url:"#how-should-i-design-my-schema-in-hbase",title:e.jsx(e.Fragment,{children:"How should I design my schema in HBase?"})},{depth:4,url:"#how-can-i-store-fill-in-the-blank-in-hbase",title:e.jsx(e.Fragment,{children:"How can I store (fill in the blank) in HBase?"})},{depth:4,url:"#how-can-i-handle-secondary-indexes-in-hbase",title:e.jsx(e.Fragment,{children:"How can I handle secondary indexes in HBase?"})},{depth:4,url:"#can-i-change-a-tables-rowkeys",title:e.jsx(e.Fragment,{children:"Can I change a table's rowkeys?"})},{depth:4,url:"#what-apis-does-hbase-support",title:e.jsx(e.Fragment,{children:"What APIs does HBase support?"})},{depth:2,url:"#faq-mapreduce",title:e.jsx(e.Fragment,{children:"MapReduce"})},{depth:4,url:"#how-can-i-use-mapreduce-with-hbase",title:e.jsx(e.Fragment,{children:"How can I use MapReduce with HBase?"})},{depth:2,url:"#performance-and-troubleshooting",title:e.jsx(e.Fragment,{children:"Performance and Troubleshooting"})},{depth:4,url:"#how-can-i-improve-hbase-cluster-performance",title:e.jsx(e.Fragment,{children:"How can I improve HBase cluster performance?"})},{depth:4,url:"#how-can-i-troubleshoot-my-hbase-cluster",title:e.jsx(e.Fragment,{children:"How can I troubleshoot my HBase cluster?"})},{depth:2,url:"#faq-amazon-ec2",title:e.jsx(e.Fragment,{children:"Amazon EC2"})},{depth:4,url:"#i-am-running-hbase-on-amazon-ec2-and",title:e.jsx(e.Fragment,{children:"I am running HBase on Amazon EC2 and..."})},{depth:2,url:"#operations",title:e.jsx(e.Fragment,{children:"Operations"})},{depth:4,url:"#how-do-i-manage-my-hbase-cluster",title:e.jsx(e.Fragment,{children:"How do I manage my HBase cluster?"})},{depth:4,url:"#how-do-i-back-up-my-hbase-cluster",title:e.jsx(e.Fragment,{children:"How do I back up my HBase cluster?"})},{depth:2,url:"#hbase-in-action",title:e.jsx(e.Fragment,{children:"HBase in Action"})},{depth:4,url:"#where-can-i-find-interesting-videos-and-presentations-on-hbase",title:e.jsx(e.Fragment,{children:"Where can I find interesting videos and presentations on HBase?"})}];function s(a){const n={a:"a",code:"code",h2:"h2",h4:"h4",p:"p",pre:"pre",span:"span",strong:"strong",...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"general",children:"General"}),`
`,e.jsx(n.h4,{id:"faq-when-should-i-use-hbase",children:"When should I use HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/architecture/overview",children:"Overview"})," in the Architecture chapter."]}),`
`,e.jsx(n.h4,{id:"does-hbase-support-sql",children:"Does HBase support SQL?"}),`
`,e.jsxs(n.p,{children:["Not really. SQL-ish support for HBase via ",e.jsx(n.a,{href:"https://hive.apache.org/",children:"Hive"})," is in development, however Hive is based on MapReduce which is not generally suitable for low-latency requests. See the ",e.jsx(n.a,{href:"/docs/datamodel",children:"Data Model"})," section for examples on the HBase client."]}),`
`,e.jsx(n.h4,{id:"how-can-i-find-examples-of-nosqlhbase",children:"How can I find examples of NoSQL/HBase?"}),`
`,e.jsxs(n.p,{children:["See the link to the BigTable paper in ",e.jsx(n.a,{href:"/docs/other-info",children:"Other Information About HBase"}),", as well as the other papers."]}),`
`,e.jsx(n.h4,{id:"what-is-the-history-of-hbase",children:"What is the history of HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/hbase-history",children:"HBase History"}),"."]}),`
`,e.jsx(n.h4,{id:"why-are-the-cells-above-10mb-not-recommended-for-hbase",children:"Why are the cells above 10MB not recommended for HBase?"}),`
`,e.jsx(n.p,{children:"Large cells don't fit well into HBase's approach to buffering data. First, the large cells bypass the MemStoreLAB when they are written. Then, they cannot be cached in the L2 block cache during read operations. Instead, HBase has to allocate on-heap memory for them each time. This can have a significant impact on the garbage collector within the RegionServer process."}),`
`,e.jsx(n.h2,{id:"faq-upgrading",children:"Upgrading"}),`
`,e.jsx(n.h4,{id:"how-do-i-upgrade-maven-managed-projects-from-hbase-094-to-hbase-096",children:"How do I upgrade Maven-managed projects from HBase 0.94 to HBase 0.96+?"}),`
`,e.jsxs(n.p,{children:["In HBase 0.96, the project moved to a modular structure. Adjust your project's dependencies to rely upon the ",e.jsx(n.code,{children:"hbase-client"}),' module or another module as appropriate, rather than a single JAR. You can model your Maven dependency after one of the following, depending on your targeted version of HBase. See Section 3.5, "Upgrading from 0.94.x to 0.96.x" or Section 3.3, "Upgrading from 0.96.x to 0.98.x" for more information.']}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Maven Dependency for HBase 0.98"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hbase</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase-client</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">0.98.5-hadoop2</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Maven Dependency for HBase 0.96"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hbase</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase-client</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">0.96.2-hadoop2</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Maven Dependency for HBase 0.94"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hbase</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">0.94.3</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.h2,{id:"faq-architecture",children:"Architecture"}),`
`,e.jsx(n.h4,{id:"how-does-hbase-handle-region-regionserver-assignment-and-locality",children:"How does HBase handle Region-RegionServer assignment and locality?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/architecture/regions",children:"Regions"}),"."]}),`
`,e.jsx(n.h2,{id:"faq-configuration",children:"Configuration"}),`
`,e.jsx(n.h4,{id:"how-can-i-get-started-with-my-first-cluster",children:"How can I get started with my first cluster?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/getting-started#quick-start---standalone-hbase",children:"Quick Start - Standalone HBase"}),"."]}),`
`,e.jsx(n.h4,{id:"where-can-i-learn-about-the-rest-of-the-configuration-options",children:"Where can I learn about the rest of the configuration options?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/configuration",children:"Apache HBase Configuration"}),"."]}),`
`,e.jsx(n.h2,{id:"schema-design--data-access",children:"Schema Design / Data Access"}),`
`,e.jsx(n.h4,{id:"how-should-i-design-my-schema-in-hbase",children:"How should I design my schema in HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/datamodel",children:"Data Model"})," and ",e.jsx(n.a,{href:"/docs/schema-design",children:"HBase and Schema Design"}),"."]}),`
`,e.jsx(n.h4,{id:"how-can-i-store-fill-in-the-blank-in-hbase",children:"How can I store (fill in the blank) in HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/regionserver-sizing#supported-datatypes",children:"Supported Datatypes"}),"."]}),`
`,e.jsx(n.h4,{id:"how-can-i-handle-secondary-indexes-in-hbase",children:"How can I handle secondary indexes in HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/regionserver-sizing#secondary-indexes-and-alternate-query-paths",children:"Secondary Indexes and Alternate Query Paths"}),"."]}),`
`,e.jsx(n.h4,{id:"can-i-change-a-tables-rowkeys",children:"Can I change a table's rowkeys?"}),`
`,e.jsxs(n.p,{children:["This is a very common question. You can't. See ",e.jsx(n.a,{href:"/docs/regionserver-sizing#immutability-of-rowkeys",children:"Immutability of Rowkeys"}),"."]}),`
`,e.jsx(n.h4,{id:"what-apis-does-hbase-support",children:"What APIs does HBase support?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/datamodel",children:"Data Model"}),", ",e.jsx(n.a,{href:"/docs/architecture/client",children:"Client"}),", and ",e.jsx(n.a,{href:"/docs/external-apis",children:"Apache HBase External APIs"}),"."]}),`
`,e.jsx(n.h2,{id:"faq-mapreduce",children:"MapReduce"}),`
`,e.jsx(n.h4,{id:"how-can-i-use-mapreduce-with-hbase",children:"How can I use MapReduce with HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/mapreduce",children:"HBase and MapReduce"}),"."]}),`
`,e.jsx(n.h2,{id:"performance-and-troubleshooting",children:"Performance and Troubleshooting"}),`
`,e.jsx(n.h4,{id:"how-can-i-improve-hbase-cluster-performance",children:"How can I improve HBase cluster performance?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/performance",children:"Apache HBase Performance Tuning"}),"."]}),`
`,e.jsx(n.h4,{id:"how-can-i-troubleshoot-my-hbase-cluster",children:"How can I troubleshoot my HBase cluster?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/troubleshooting",children:"Troubleshooting and Debugging Apache HBase"}),"."]}),`
`,e.jsx(n.h2,{id:"faq-amazon-ec2",children:"Amazon EC2"}),`
`,e.jsx(n.h4,{id:"i-am-running-hbase-on-amazon-ec2-and",children:"I am running HBase on Amazon EC2 and..."}),`
`,e.jsxs(n.p,{children:["EC2 issues are a special case. See ",e.jsx(n.a,{href:"/docs/troubleshooting#troubleshooting-amazon-ec2",children:"Amazon EC2"})," and ",e.jsx(n.a,{href:"/docs/performance#performance-amazon-ec2",children:"Amazon EC2"}),"."]}),`
`,e.jsx(n.h2,{id:"operations",children:"Operations"}),`
`,e.jsx(n.h4,{id:"how-do-i-manage-my-hbase-cluster",children:"How do I manage my HBase cluster?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/operational-management",children:"Apache HBase Operational Management"}),"."]}),`
`,e.jsx(n.h4,{id:"how-do-i-back-up-my-hbase-cluster",children:"How do I back up my HBase cluster?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/operational-management/backup-and-snapshots#hbase-backup",children:"HBase Backup"}),"."]}),`
`,e.jsx(n.h2,{id:"hbase-in-action",children:"HBase in Action"}),`
`,e.jsx(n.h4,{id:"where-can-i-find-interesting-videos-and-presentations-on-hbase",children:"Where can I find interesting videos and presentations on HBase?"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/other-info",children:"Other Information About HBase"}),"."]})]})}function c(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}export{t as _markdown,c as default,o as extractedReferences,r as frontmatter,h as structuredData,d as toc};
