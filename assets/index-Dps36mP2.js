import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`Herein you will find either the definitive documentation on an HBase topic as of its
standing when the referenced HBase version shipped, or it will point to the location
in [Javadoc](https://hbase.apache.org/apidocs/index.html) or
[JIRA](https://issues.apache.org/jira/browse/HBASE) where the pertinent information can be found.

## About This Guide

This reference guide is a work in progress. The source for this guide can be found in the
*hbase-website/app/pages/\\_docs/docs/\\_mdx/(multi-page)* directory of the HBase source. This reference guide is marked up
using [MDX](https://mdxjs.com/) (just extended markdown) powered by [Fumadocs](https://fumadocs.dev/) from which the finished guide is generated as part of the
'site' build target. Run

\`\`\`bash
mvn site
\`\`\`

to generate this documentation.
Amendments and improvements to the documentation are welcomed.
Click
[this link](https://issues.apache.org/jira/secure/CreateIssueDetails!init.jspa?pid=12310753\\&issuetype=1\\&components=12312132\\&summary=SHORT+DESCRIPTION)
to file a new documentation bug against Apache HBase with some values pre-selected.

## Contributing to the Documentation

For an overview and suggestions to get started contributing to the documentation,
see the [relevant section later in this documentation](/docs/contributing-to-documentation).

## Heads-up if this is your first foray into the world of distributed computing...

If this is your first foray into the wonderful world of Distributed Computing, then you are in for some interesting times.
First off, distributed systems are hard; making a distributed system hum requires a disparate skillset that spans systems (hardware and software) and networking.

Your cluster's operation can hiccup because of any of a myriad set of reasons from bugs in HBase itself through misconfigurations — misconfiguration of HBase but also operating system misconfigurations — through to hardware problems whether it be a bug in your network card drivers or an underprovisioned RAM bus (to mention two recent examples of hardware issues that manifested as "HBase is slow"). You will also need to do a recalibration if up to this your computing has been bound to a single box.
Here is one good starting point: [Fallacies of Distributed Computing](http://en.wikipedia.org/wiki/Fallacies_of_Distributed_Computing).

That said, you are welcome.<br />
It's a fun place to be.<br />
Yours, the HBase Community.

## Reporting Bugs

Please use [JIRA](https://issues.apache.org/jira/browse/hbase) to report non-security-related bugs.

To protect existing HBase installations from new vulnerabilities, please **do not** use JIRA to report security-related bugs. Instead, send your report to the mailing list [private@hbase.apache.org](mailto:private@hbase.apache.org), which allows anyone to send messages, but restricts who can read them. Someone on that list will contact you to follow up on your report.

## Support and Testing Expectations

The phrases *supported*, *not supported*, *tested*, and *not tested* occur several
places throughout this guide. In the interest of clarity, here is a brief explanation
of what is generally meant by these phrases, in the context of HBase.

<Callout type="info">
  Commercial technical support for Apache HBase is provided by many Hadoop vendors. This is not the
  sense in which the term *support* is used in the context of the Apache HBase project. The Apache
  HBase team assumes no responsibility for your HBase clusters, your configuration, or your data.
</Callout>

### Supported

In the context of Apache HBase, *supported* means that HBase is designed to work
in the way described, and deviation from the defined behavior or functionality should
be reported as a bug.

### Not Supported

In the context of Apache HBase, *not supported* means that a use case or use pattern
is not expected to work and should be considered an antipattern. If you think this
designation should be reconsidered for a given feature or use pattern, file a JIRA
or start a discussion on one of the mailing lists.

### Tested

In the context of Apache HBase, *tested* means that a feature is covered by unit
or integration tests, and has been proven to work as expected.

### Not Tested

In the context of Apache HBase, *not tested* means that a feature or use pattern
may or may not work in a given way, and may or may not corrupt your data or cause
operational issues. It is an unknown, and there are no guarantees. If you can provide
proof that a feature designated as *not tested* does work in a given way, please
submit the tests and/or the metrics so that other users can gain certainty about
such features or use patterns.
`,d={title:"Preface",description:"This is the official reference guide for the HBase version it ships with."},h=[{href:"https://hbase.apache.org/apidocs/index.html"},{href:"https://issues.apache.org/jira/browse/HBASE"},{href:"https://mdxjs.com/"},{href:"https://fumadocs.dev/"},{href:"https://issues.apache.org/jira/secure/CreateIssueDetails!init.jspa?pid=12310753&issuetype=1&components=12312132&summary=SHORT+DESCRIPTION"},{href:"/docs/contributing-to-documentation"},{href:"http://en.wikipedia.org/wiki/Fallacies_of_Distributed_Computing"},{href:"https://issues.apache.org/jira/browse/hbase"},{href:"mailto:private@hbase.apache.org"}],u={contents:[{heading:void 0,content:`Herein you will find either the definitive documentation on an HBase topic as of its
standing when the referenced HBase version shipped, or it will point to the location
in Javadoc or
JIRA where the pertinent information can be found.`},{heading:"about-this-guide",content:`This reference guide is a work in progress. The source for this guide can be found in the
hbase-website/app/pages/_docs/docs/_mdx/(multi-page) directory of the HBase source. This reference guide is marked up
using MDX (just extended markdown) powered by Fumadocs from which the finished guide is generated as part of the
'site' build target. Run`},{heading:"about-this-guide",content:`to generate this documentation.
Amendments and improvements to the documentation are welcomed.
Click
this link
to file a new documentation bug against Apache HBase with some values pre-selected.`},{heading:"contributing-to-the-documentation",content:`For an overview and suggestions to get started contributing to the documentation,
see the relevant section later in this documentation.`},{heading:"heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",content:`If this is your first foray into the wonderful world of Distributed Computing, then you are in for some interesting times.
First off, distributed systems are hard; making a distributed system hum requires a disparate skillset that spans systems (hardware and software) and networking.`},{heading:"heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",content:`Your cluster's operation can hiccup because of any of a myriad set of reasons from bugs in HBase itself through misconfigurations — misconfiguration of HBase but also operating system misconfigurations — through to hardware problems whether it be a bug in your network card drivers or an underprovisioned RAM bus (to mention two recent examples of hardware issues that manifested as "HBase is slow"). You will also need to do a recalibration if up to this your computing has been bound to a single box.
Here is one good starting point: Fallacies of Distributed Computing.`},{heading:"heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",content:`That said, you are welcome.
It's a fun place to be.
Yours, the HBase Community.`},{heading:"reporting-bugs",content:"Please use JIRA to report non-security-related bugs."},{heading:"reporting-bugs",content:"To protect existing HBase installations from new vulnerabilities, please do not use JIRA to report security-related bugs. Instead, send your report to the mailing list private@hbase.apache.org, which allows anyone to send messages, but restricts who can read them. Someone on that list will contact you to follow up on your report."},{heading:"support-and-testing-expectations",content:`The phrases supported, not supported, tested, and not tested occur several
places throughout this guide. In the interest of clarity, here is a brief explanation
of what is generally meant by these phrases, in the context of HBase.`},{heading:"support-and-testing-expectations",content:"type: info"},{heading:"support-and-testing-expectations",content:`Commercial technical support for Apache HBase is provided by many Hadoop vendors. This is not the
sense in which the term support is used in the context of the Apache HBase project. The Apache
HBase team assumes no responsibility for your HBase clusters, your configuration, or your data.`},{heading:"supported",content:`In the context of Apache HBase, supported means that HBase is designed to work
in the way described, and deviation from the defined behavior or functionality should
be reported as a bug.`},{heading:"not-supported",content:`In the context of Apache HBase, not supported means that a use case or use pattern
is not expected to work and should be considered an antipattern. If you think this
designation should be reconsidered for a given feature or use pattern, file a JIRA
or start a discussion on one of the mailing lists.`},{heading:"tested",content:`In the context of Apache HBase, tested means that a feature is covered by unit
or integration tests, and has been proven to work as expected.`},{heading:"not-tested",content:`In the context of Apache HBase, not tested means that a feature or use pattern
may or may not work in a given way, and may or may not corrupt your data or cause
operational issues. It is an unknown, and there are no guarantees. If you can provide
proof that a feature designated as not tested does work in a given way, please
submit the tests and/or the metrics so that other users can gain certainty about
such features or use patterns.`}],headings:[{id:"about-this-guide",content:"About This Guide"},{id:"contributing-to-the-documentation",content:"Contributing to the Documentation"},{id:"heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",content:"Heads-up if this is your first foray into the world of distributed computing..."},{id:"reporting-bugs",content:"Reporting Bugs"},{id:"support-and-testing-expectations",content:"Support and Testing Expectations"},{id:"supported",content:"Supported"},{id:"not-supported",content:"Not Supported"},{id:"tested",content:"Tested"},{id:"not-tested",content:"Not Tested"}]};const c=[{depth:2,url:"#about-this-guide",title:e.jsx(e.Fragment,{children:"About This Guide"})},{depth:2,url:"#contributing-to-the-documentation",title:e.jsx(e.Fragment,{children:"Contributing to the Documentation"})},{depth:2,url:"#heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",title:e.jsx(e.Fragment,{children:"Heads-up if this is your first foray into the world of distributed computing..."})},{depth:2,url:"#reporting-bugs",title:e.jsx(e.Fragment,{children:"Reporting Bugs"})},{depth:2,url:"#support-and-testing-expectations",title:e.jsx(e.Fragment,{children:"Support and Testing Expectations"})},{depth:3,url:"#supported",title:e.jsx(e.Fragment,{children:"Supported"})},{depth:3,url:"#not-supported",title:e.jsx(e.Fragment,{children:"Not Supported"})},{depth:3,url:"#tested",title:e.jsx(e.Fragment,{children:"Tested"})},{depth:3,url:"#not-tested",title:e.jsx(e.Fragment,{children:"Not Tested"})}];function o(n){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",strong:"strong",...n.components},{Callout:s}=t;return s||i("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:[`Herein you will find either the definitive documentation on an HBase topic as of its
standing when the referenced HBase version shipped, or it will point to the location
in `,e.jsx(t.a,{href:"https://hbase.apache.org/apidocs/index.html",children:"Javadoc"}),` or
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE",children:"JIRA"})," where the pertinent information can be found."]}),`
`,e.jsx(t.h2,{id:"about-this-guide",children:"About This Guide"}),`
`,e.jsxs(t.p,{children:[`This reference guide is a work in progress. The source for this guide can be found in the
`,e.jsx(t.em,{children:"hbase-website/app/pages/_docs/docs/_mdx/(multi-page)"}),` directory of the HBase source. This reference guide is marked up
using `,e.jsx(t.a,{href:"https://mdxjs.com/",children:"MDX"})," (just extended markdown) powered by ",e.jsx(t.a,{href:"https://fumadocs.dev/",children:"Fumadocs"}),` from which the finished guide is generated as part of the
'site' build target. Run`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" site"})]})})})}),`
`,e.jsxs(t.p,{children:[`to generate this documentation.
Amendments and improvements to the documentation are welcomed.
Click
`,e.jsx(t.a,{href:"https://issues.apache.org/jira/secure/CreateIssueDetails!init.jspa?pid=12310753&issuetype=1&components=12312132&summary=SHORT+DESCRIPTION",children:"this link"}),`
to file a new documentation bug against Apache HBase with some values pre-selected.`]}),`
`,e.jsx(t.h2,{id:"contributing-to-the-documentation",children:"Contributing to the Documentation"}),`
`,e.jsxs(t.p,{children:[`For an overview and suggestions to get started contributing to the documentation,
see the `,e.jsx(t.a,{href:"/docs/contributing-to-documentation",children:"relevant section later in this documentation"}),"."]}),`
`,e.jsx(t.h2,{id:"heads-up-if-this-is-your-first-foray-into-the-world-of-distributed-computing",children:"Heads-up if this is your first foray into the world of distributed computing..."}),`
`,e.jsx(t.p,{children:`If this is your first foray into the wonderful world of Distributed Computing, then you are in for some interesting times.
First off, distributed systems are hard; making a distributed system hum requires a disparate skillset that spans systems (hardware and software) and networking.`}),`
`,e.jsxs(t.p,{children:[`Your cluster's operation can hiccup because of any of a myriad set of reasons from bugs in HBase itself through misconfigurations — misconfiguration of HBase but also operating system misconfigurations — through to hardware problems whether it be a bug in your network card drivers or an underprovisioned RAM bus (to mention two recent examples of hardware issues that manifested as "HBase is slow"). You will also need to do a recalibration if up to this your computing has been bound to a single box.
Here is one good starting point: `,e.jsx(t.a,{href:"http://en.wikipedia.org/wiki/Fallacies_of_Distributed_Computing",children:"Fallacies of Distributed Computing"}),"."]}),`
`,e.jsxs(t.p,{children:["That said, you are welcome.",e.jsx("br",{}),`
It's a fun place to be.`,e.jsx("br",{}),`
Yours, the HBase Community.`]}),`
`,e.jsx(t.h2,{id:"reporting-bugs",children:"Reporting Bugs"}),`
`,e.jsxs(t.p,{children:["Please use ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/hbase",children:"JIRA"})," to report non-security-related bugs."]}),`
`,e.jsxs(t.p,{children:["To protect existing HBase installations from new vulnerabilities, please ",e.jsx(t.strong,{children:"do not"})," use JIRA to report security-related bugs. Instead, send your report to the mailing list ",e.jsx(t.a,{href:"mailto:private@hbase.apache.org",children:"private@hbase.apache.org"}),", which allows anyone to send messages, but restricts who can read them. Someone on that list will contact you to follow up on your report."]}),`
`,e.jsx(t.h2,{id:"support-and-testing-expectations",children:"Support and Testing Expectations"}),`
`,e.jsxs(t.p,{children:["The phrases ",e.jsx(t.em,{children:"supported"}),", ",e.jsx(t.em,{children:"not supported"}),", ",e.jsx(t.em,{children:"tested"}),", and ",e.jsx(t.em,{children:"not tested"}),` occur several
places throughout this guide. In the interest of clarity, here is a brief explanation
of what is generally meant by these phrases, in the context of HBase.`]}),`
`,e.jsx(s,{type:"info",children:e.jsxs(t.p,{children:[`Commercial technical support for Apache HBase is provided by many Hadoop vendors. This is not the
sense in which the term `,e.jsx(t.em,{children:"support"}),` is used in the context of the Apache HBase project. The Apache
HBase team assumes no responsibility for your HBase clusters, your configuration, or your data.`]})}),`
`,e.jsx(t.h3,{id:"supported",children:"Supported"}),`
`,e.jsxs(t.p,{children:["In the context of Apache HBase, ",e.jsx(t.em,{children:"supported"}),` means that HBase is designed to work
in the way described, and deviation from the defined behavior or functionality should
be reported as a bug.`]}),`
`,e.jsx(t.h3,{id:"not-supported",children:"Not Supported"}),`
`,e.jsxs(t.p,{children:["In the context of Apache HBase, ",e.jsx(t.em,{children:"not supported"}),` means that a use case or use pattern
is not expected to work and should be considered an antipattern. If you think this
designation should be reconsidered for a given feature or use pattern, file a JIRA
or start a discussion on one of the mailing lists.`]}),`
`,e.jsx(t.h3,{id:"tested",children:"Tested"}),`
`,e.jsxs(t.p,{children:["In the context of Apache HBase, ",e.jsx(t.em,{children:"tested"}),` means that a feature is covered by unit
or integration tests, and has been proven to work as expected.`]}),`
`,e.jsx(t.h3,{id:"not-tested",children:"Not Tested"}),`
`,e.jsxs(t.p,{children:["In the context of Apache HBase, ",e.jsx(t.em,{children:"not tested"}),` means that a feature or use pattern
may or may not work in a given way, and may or may not corrupt your data or cause
operational issues. It is an unknown, and there are no guarantees. If you can provide
proof that a feature designated as `,e.jsx(t.em,{children:"not tested"}),` does work in a given way, please
submit the tests and/or the metrics so that other users can gain certainty about
such features or use patterns.`]})]})}function p(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}function i(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,p as default,h as extractedReferences,d as frontmatter,u as structuredData,c as toc};
