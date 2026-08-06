import{j as e}from"./components-BCHf_v1I.js";let r=`The catalog table \`hbase:meta\` exists as an HBase table and is filtered out of the HBase shell's \`list\` command, but is in fact a table just like any other.

## hbase:meta

The \`hbase:meta\` table (previously called \`.META.\`) keeps a list of all regions in the system, and the location of \`hbase:meta\` is stored in ZooKeeper.

The \`hbase:meta\` table structure is as follows:

**Key:**

* Region key of the format (\`[table],[region start key],[region id]\`)

**Values:**

* \`info:regioninfo\` (serialized [RegionInfo](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html) instance for this region)
* \`info:server\` (server:port of the RegionServer containing this region)
* \`info:serverstartcode\` (start-time of the RegionServer process containing this region)

When a table is in the process of splitting, two other columns will be created, called \`info:splitA\` and \`info:splitB\`. These columns represent the two daughter regions. The values for these columns are also serialized HRegionInfo instances. After the region has been split, eventually this row will be deleted.

<Callout type="info" title="Note on HRegionInfo">
  The empty key is used to denote table start and table end. A region with an empty start key is the
  first region in a table. If a region has both an empty start and an empty end key, it is the only
  region in the table
</Callout>

In the (hopefully unlikely) event that programmatic processing of catalog metadata is required, see the [RegionInfo.parseFrom](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html#parseFrom\\(byte%5B%5D\\)) utility.

## Startup Sequencing

First, the location of \`hbase:meta\` is looked up in ZooKeeper. Next, \`hbase:meta\` is updated with server and startcode values.

For information on region-RegionServer assignment, see [Region-RegionServer Assignment](/docs/architecture/regions#region-regionserver-assignment).
`,h={title:"Catalog Tables",description:"Understanding hbase:meta catalog table structure, location tracking, and how HBase maintains region metadata."},l=[{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html#parseFrom(byte%5B%5D)"},{href:"/docs/architecture/regions#region-regionserver-assignment"}],c={contents:[{heading:void 0,content:"The catalog table `hbase:meta` exists as an HBase table and is filtered out of the HBase shell's `list` command, but is in fact a table just like any other."},{heading:"hbasemeta",content:"The `hbase:meta` table (previously called `.META.`) keeps a list of all regions in the system, and the location of `hbase:meta` is stored in ZooKeeper."},{heading:"hbasemeta",content:"The `hbase:meta` table structure is as follows:"},{heading:"hbasemeta",content:"**Key:**"},{heading:"hbasemeta",content:"Region key of the format (`[table],[region start key],[region id]`)"},{heading:"hbasemeta",content:"**Values:**"},{heading:"hbasemeta",content:"`info:regioninfo` (serialized RegionInfo instance for this region)"},{heading:"hbasemeta",content:"`info:server` (server:port of the RegionServer containing this region)"},{heading:"hbasemeta",content:"`info:serverstartcode` (start-time of the RegionServer process containing this region)"},{heading:"hbasemeta",content:"When a table is in the process of splitting, two other columns will be created, called `info:splitA` and `info:splitB`. These columns represent the two daughter regions. The values for these columns are also serialized HRegionInfo instances. After the region has been split, eventually this row will be deleted."},{heading:"hbasemeta",content:`The empty key is used to denote table start and table end. A region with an empty start key is the
first region in a table. If a region has both an empty start and an empty end key, it is the only
region in the table`},{heading:"hbasemeta",content:"In the (hopefully unlikely) event that programmatic processing of catalog metadata is required, see the RegionInfo.parseFrom utility."},{heading:"startup-sequencing",content:"First, the location of `hbase:meta` is looked up in ZooKeeper. Next, `hbase:meta` is updated with server and startcode values."},{heading:"startup-sequencing",content:"For information on region-RegionServer assignment, see Region-RegionServer Assignment."}],headings:[{id:"hbasemeta",content:"hbase:meta"},{id:"startup-sequencing",content:"Startup Sequencing"}]},d=[{depth:2,url:"#hbasemeta",title:e.jsx(e.Fragment,{children:"hbase:meta"})},{depth:2,url:"#startup-sequencing",title:e.jsx(e.Fragment,{children:"Startup Sequencing"})}];function i(n){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:a}=t;return a||s("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["The catalog table ",e.jsx(t.code,{children:"hbase:meta"})," exists as an HBase table and is filtered out of the HBase shell's ",e.jsx(t.code,{children:"list"})," command, but is in fact a table just like any other."]}),`
`,e.jsx(t.h2,{id:"hbasemeta",children:"hbase:meta"}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"hbase:meta"})," table (previously called ",e.jsx(t.code,{children:".META."}),") keeps a list of all regions in the system, and the location of ",e.jsx(t.code,{children:"hbase:meta"})," is stored in ZooKeeper."]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"hbase:meta"})," table structure is as follows:"]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Key:"})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Region key of the format (",e.jsx(t.code,{children:"[table],[region start key],[region id]"}),")"]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Values:"})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"info:regioninfo"})," (serialized ",e.jsx(t.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html",children:"RegionInfo"})," instance for this region)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"info:server"})," (server:port of the RegionServer containing this region)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"info:serverstartcode"})," (start-time of the RegionServer process containing this region)"]}),`
`]}),`
`,e.jsxs(t.p,{children:["When a table is in the process of splitting, two other columns will be created, called ",e.jsx(t.code,{children:"info:splitA"})," and ",e.jsx(t.code,{children:"info:splitB"}),". These columns represent the two daughter regions. The values for these columns are also serialized HRegionInfo instances. After the region has been split, eventually this row will be deleted."]}),`
`,e.jsx(a,{type:"info",title:"Note on HRegionInfo",children:e.jsx(t.p,{children:`The empty key is used to denote table start and table end. A region with an empty start key is the
first region in a table. If a region has both an empty start and an empty end key, it is the only
region in the table`})}),`
`,e.jsxs(t.p,{children:["In the (hopefully unlikely) event that programmatic processing of catalog metadata is required, see the ",e.jsx(t.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/RegionInfo.html#parseFrom(byte%5B%5D)",children:"RegionInfo.parseFrom"})," utility."]}),`
`,e.jsx(t.h2,{id:"startup-sequencing",children:"Startup Sequencing"}),`
`,e.jsxs(t.p,{children:["First, the location of ",e.jsx(t.code,{children:"hbase:meta"})," is looked up in ZooKeeper. Next, ",e.jsx(t.code,{children:"hbase:meta"})," is updated with server and startcode values."]}),`
`,e.jsxs(t.p,{children:["For information on region-RegionServer assignment, see ",e.jsx(t.a,{href:"/docs/architecture/regions#region-regionserver-assignment",children:"Region-RegionServer Assignment"}),"."]})]})}function g(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,g as default,l as extractedReferences,h as frontmatter,c as structuredData,d as toc};
