import{j as e}from"./components-BCHf_v1I.js";let i=`As HBase runs on HDFS (and each StoreFile is written as a file on HDFS), it is important to have an understanding of the HDFS Architecture especially in terms of how it stores files, handles failovers, and replicates blocks.

See the Hadoop documentation on [HDFS Architecture](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) for more information.

## NameNode

The NameNode is responsible for maintaining the filesystem metadata. See the above HDFS Architecture link for more information.

## DataNode

The DataNodes are responsible for storing HDFS blocks. See the above HDFS Architecture link for more information.
`,r={title:"HDFS",description:"How HBase leverages HDFS for distributed storage, including NameNode and DataNode architecture and file replication."},s=[{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html"}],d={contents:[{heading:void 0,content:"As HBase runs on HDFS (and each StoreFile is written as a file on HDFS), it is important to have an understanding of the HDFS Architecture especially in terms of how it stores files, handles failovers, and replicates blocks."},{heading:void 0,content:"See the Hadoop documentation on HDFS Architecture for more information."},{heading:"hdfs-namenode",content:"The NameNode is responsible for maintaining the filesystem metadata. See the above HDFS Architecture link for more information."},{heading:"hdfs-datanode",content:"The DataNodes are responsible for storing HDFS blocks. See the above HDFS Architecture link for more information."}],headings:[{id:"hdfs-namenode",content:"NameNode"},{id:"hdfs-datanode",content:"DataNode"}]},h=[{depth:2,url:"#hdfs-namenode",title:e.jsx(e.Fragment,{children:"NameNode"})},{depth:2,url:"#hdfs-datanode",title:e.jsx(e.Fragment,{children:"DataNode"})}];function o(n){const t={a:"a",h2:"h2",p:"p",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"As HBase runs on HDFS (and each StoreFile is written as a file on HDFS), it is important to have an understanding of the HDFS Architecture especially in terms of how it stores files, handles failovers, and replicates blocks."}),`
`,e.jsxs(t.p,{children:["See the Hadoop documentation on ",e.jsx(t.a,{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html",children:"HDFS Architecture"})," for more information."]}),`
`,e.jsx(t.h2,{id:"hdfs-namenode",children:"NameNode"}),`
`,e.jsx(t.p,{children:"The NameNode is responsible for maintaining the filesystem metadata. See the above HDFS Architecture link for more information."}),`
`,e.jsx(t.h2,{id:"hdfs-datanode",children:"DataNode"}),`
`,e.jsx(t.p,{children:"The DataNodes are responsible for storing HDFS blocks. See the above HDFS Architecture link for more information."})]})}function c(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{i as _markdown,c as default,s as extractedReferences,r as frontmatter,d as structuredData,h as toc};
