import{j as e,w as s}from"./chunk-EPOLDU6W-B5LwAila.js";import{M as a}from"./mdx-components-bjiyHZUo.js";import"./mdx-DXQ3RXga.js";import"./index-BE31Pm92.js";import"./index-lnR2ABT4.js";import"./index-FCA4GwU0.js";import"./link-CDX6ZyVQ.js";import"./external-link-jmuPj2if.js";import"./createLucideIcon-BidaCVke.js";e.jsx(e.Fragment,{children:"ACID properties of HBase"}),e.jsx(e.Fragment,{children:"Definitions"}),e.jsx(e.Fragment,{children:"APIs to consider"}),e.jsx(e.Fragment,{children:"Guarantees Provided"}),e.jsx(e.Fragment,{children:"Atomicity"}),e.jsx(e.Fragment,{children:"Consistency and Isolation"}),e.jsx(e.Fragment,{children:"Consistency of Scans"}),e.jsx(e.Fragment,{children:"Visibility"}),e.jsx(e.Fragment,{children:"Durability"}),e.jsx(e.Fragment,{children:"Tunability"}),e.jsx(e.Fragment,{children:"More Information"}),e.jsx(e.Fragment,{children:"Footnotes"});function i(n){const t={a:"a",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"acid-properties-of-hbase",children:"ACID properties of HBase"}),`
`,e.jsx(t.p,{children:"Apache HBase (TM) is not an ACID compliant database. However, it does guarantee certain specific properties."}),`
`,e.jsx(t.h2,{id:"definitions",children:"Definitions"}),`
`,e.jsx(t.p,{children:"For the sake of common vocabulary, we define the following terms:"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Atomicity"}),`
an operation is atomic if it either completes entirely or not at all`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Consistency"}),`
all actions cause the table to transition from one valid state directly to another (eg a row will not disappear during an update, etc)`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Isolation"}),`
an operation is isolated if it appears to complete independently of any other concurrent transaction`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Durability"}),`
any update that reports "successful" to the client will not be lost`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Visibility"}),`
an update is considered visible if any subsequent read will see the update as having been committed`]}),`
`,e.jsxs(t.p,{children:["The terms ",e.jsx(t.em,{children:"must"})," and ",e.jsx(t.em,{children:"may"}),' are used as specified by RFC 2119. In short, the word "must" implies that, if some case exists where the statement is not true, it is a bug. The word "may" implies that, even if the guarantee is provided in a current release, users should not rely on it.']}),`
`,e.jsx(t.h2,{id:"apis-to-consider",children:"APIs to consider"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Read APIs",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"get"}),`
`,e.jsx(t.li,{children:"scan"}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:["Write APIs",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"put"}),`
`,e.jsx(t.li,{children:"batch put"}),`
`,e.jsx(t.li,{children:"delete"}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:["Combination (read-modify-write) APIs",`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"incrementColumnValue"}),`
`,e.jsx(t.li,{children:"checkAndPut"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(t.h2,{id:"guarantees-provided",children:"Guarantees Provided"}),`
`,e.jsx(t.h3,{id:"atomicity",children:"Atomicity"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["All mutations are atomic within a row. Any put will either wholly succeed or wholly fail.[3]",`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:'An operation that returns a "success" code has completely succeeded.'}),`
`,e.jsx(t.li,{children:'An operation that returns a "failure" code has completely failed.'}),`
`,e.jsx(t.li,{children:"An operation that times out may have succeeded and may have failed. However, it will not have partially succeeded or failed."}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:"This is true even if the mutation crosses multiple column families within a row."}),`
`,e.jsxs(t.li,{children:["APIs that mutate several rows will ",e.jsx(t.em,{children:"not"})," be atomic across the multiple rows. For example, a multiput that operates on rows 'a','b', and 'c' may return having mutated some but not all of the rows. In such cases, these APIs will return a list of success codes, each of which may be succeeded, failed, or timed out as described above."]}),`
`,e.jsx(t.li,{children:"The checkAndPut API happens atomically like the typical compareAndSet (CAS) operation found in many hardware architectures."}),`
`,e.jsxs(t.li,{children:['The order of mutations is seen to happen in a well-defined order for each row, with no interleaving. For example, if one writer issues the mutation "a=1,b=1,c=1" and another writer issues the mutation "a=2,b=2,c=2", the row must either be "a=1,b=1,c=1" or "a=2,b=2,c=2" and must ',e.jsx(t.em,{children:"not"}),' be something like "a=1,b=2,c=1".',`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Please note that this is not true ",e.jsx(t.em,{children:"across rows"})," for multirow batch mutations."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(t.h3,{id:"consistency-and-isolation",children:"Consistency and Isolation"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"All rows returned via any access API will consist of a complete row that existed at some point in the table's history."}),`
`,e.jsx(t.li,{children:"This is true across column families - i.e a get of a full row that occurs concurrent with some mutations 1,2,3,4,5 will return a complete row that existed at some point in time between mutation i and i+1 for some i between 1 and 5."}),`
`,e.jsx(t.li,{children:"The state of a row will only move forward through the history of edits to it."}),`
`]}),`
`,e.jsx(t.h4,{id:"consistency-of-scans",children:"Consistency of Scans"}),`
`,e.jsxs(t.p,{children:["A scan is ",e.jsx(t.strong,{children:"not"})," a consistent view of a table. Scans do ",e.jsx(t.strong,{children:"not"})," exhibit ",e.jsx(t.em,{children:"snapshot isolation"}),"."]}),`
`,e.jsx(t.p,{children:"Rather, scans have the following properties:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Any row returned by the scan will be a consistent view (i.e. that version of the complete row existed at some point in time) [1]"}),`
`,e.jsxs(t.li,{children:["A scan will always reflect a view of the data ",e.jsx(t.em,{children:"at least as new as"})," the beginning of the scan. This satisfies the visibility guarantees enumerated below.",`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"For example, if client A writes data X and then communicates via a side channel to client B, any scans started by client B will contain data at least as new as X."}),`
`,e.jsxs(t.li,{children:["A scan ",e.jsx(t.em,{children:"must"})," reflect all mutations committed prior to the construction of the scanner, and ",e.jsx(t.em,{children:"may"})," reflect some mutations committed subsequent to the construction of the scanner."]}),`
`,e.jsxs(t.li,{children:["Scans must include ",e.jsx(t.em,{children:"all"})," data written prior to the scan (except in the case where data is subsequently mutated, in which case it ",e.jsx(t.em,{children:"may"})," reflect the mutation)"]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(t.p,{children:'Those familiar with relational databases will recognize this isolation level as "read committed".'}),`
`,e.jsxs(t.p,{children:['Please note that the guarantees listed above regarding scanner consistency are referring to "transaction commit time", not the "timestamp" field of each cell. That is to say, a scanner started at time ',e.jsx(t.em,{children:"t"})," may see edits with a timestamp value greater than ",e.jsx(t.em,{children:"t"}),', if those edits were committed with a "forward dated" timestamp before the scanner was constructed.']}),`
`,e.jsx(t.h3,{id:"visibility",children:"Visibility"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:'When a client receives a "success" response for any mutation, that mutation is immediately visible to both that client and any client with whom it later communicates through side channels. [3]'}),`
`,e.jsxs(t.li,{children:['A row must never exhibit so-called "time-travel" properties. That is to say, if a series of mutations moves a row sequentially through a series of states, any sequence of concurrent reads will return a subsequence of those states.',`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:`For example, if a row's cells are mutated using the "incrementColumnValue" API, a client must never see the value of any cell decrease.`}),`
`,e.jsx(t.li,{children:"This is true regardless of which read API is used to read back the mutation."}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:"Any version of a cell that has been returned to a read operation is guaranteed to be durably stored."}),`
`]}),`
`,e.jsx(t.h3,{id:"durability",children:"Durability"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"All visible data is also durable data. That is to say, a read will never return data that has not been made durable on disk[2]"}),`
`,e.jsx(t.li,{children:'Any operation that returns a "success" code (eg does not throw an exception) will be made durable.[3]'}),`
`,e.jsx(t.li,{children:'Any operation that returns a "failure" code will not be made durable (subject to the Atomicity guarantees above)'}),`
`,e.jsx(t.li,{children:"All reasonable failure scenarios will not affect any of the guarantees of this document."}),`
`]}),`
`,e.jsx(t.h3,{id:"tunability",children:"Tunability"}),`
`,e.jsx(t.p,{children:"All of the above guarantees must be possible within Apache HBase. For users who would like to trade off some guarantees for performance, HBase may offer several tuning options. For example:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Visibility may be tuned on a per-read basis to allow stale reads or time travel."}),`
`,e.jsx(t.li,{children:"Durability may be tuned to only flush data to disk on a periodic basis"}),`
`]}),`
`,e.jsx(t.h2,{id:"more-information",children:"More Information"}),`
`,e.jsxs(t.p,{children:["For more information, see the ",e.jsx(t.a,{href:"/docs/architecture/client",children:"client architecture"})," or ",e.jsx(t.a,{href:"/docs/datamodel",children:"data model"})," sections in the Apache HBase Reference Guide."]}),`
`,e.jsx(t.h2,{id:"footnotes",children:"Footnotes"}),`
`,e.jsxs(t.p,{children:["[1] A consistent view is not guaranteed intra-row scanning -- i.e. fetching a portion of a row in one RPC then going back to fetch another portion of the row in a subsequent RPC. Intra-row scanning happens when you set a limit on how many values to return per Scan#next (See ",e.jsx(t.a,{href:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setBatch(int)",children:"Scan#setBatch(int)"}),")."]}),`
`,e.jsx(t.p,{children:'[2] In the context of Apache HBase, "durably on disk" implies an hflush() call on the transaction log. This does not actually imply an fsync() to magnetic media, but rather just that the data has been written to the OS cache on all replicas of the log. In the case of a full datacenter power loss, it is possible that the edits are not truly durable.'}),`
`,e.jsx(t.p,{children:"[3] Puts will either wholly succeed or wholly fail, provided that they are actually sent to the RegionServer. If the writebuffer is used, Puts will not be sent until the writebuffer is filled or it is explicitly flushed."})]})}function r(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}function o(){return e.jsx(a,{Content:r,className:"mt-12"})}function j({}){return[{title:"ACID Semantics - Apache HBase"},{name:"description",content:"Apache HBase ACID properties and guarantees specification."}]}const w=s(function(){return e.jsx(o,{})});export{w as default,j as meta};
