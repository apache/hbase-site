import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`## Background

[HBASE-21926](https://issues.apache.org/jira/browse/HBASE-21926) introduced a new servlet that
supports integrated, on-demand profiling via the
[Async Profiler](https://github.com/jvm-profiling-tools/async-profiler) project.

## Prerequisites

Go to the [Async Profiler Home Page](https://github.com/jvm-profiling-tools/async-profiler), download
a release appropriate for your platform, and install on every cluster host. If running a Linux
kernel v4.6 or later, be sure to set proc variables as per the
[Basic Usage](https://github.com/jvm-profiling-tools/async-profiler#basic-usage) section. Not doing
so will result in flame graphs that contain no content.

Set \`ASYNC_PROFILER_HOME\` in the environment (put it in hbase-env.sh) to the root directory of the
async-profiler install location, or pass it on the HBase daemon's command line as a system property
as \`-Dasync.profiler.home=/path/to/async-profiler\`.

## Usage

Once the prerequisites are satisfied, access to async-profiler is available by way of the HBase UI
or direct interaction with the infoserver.

Examples:

* To collect 30 second CPU profile of current process (returns FlameGraph svg)
  \`curl http://localhost:16030/prof\`
* To collect 1 minute CPU profile of current process and output in tree format (html)
  \`curl http://localhost:16030/prof?output=tree&duration=60\`
* To collect 30 second heap allocation profile of current process (returns FlameGraph svg)
  \`curl http://localhost:16030/prof?event=alloc\`
* To collect lock contention profile of current process (returns FlameGraph svg)
  \`curl http://localhost:16030/prof?event=lock\`

The following event types are supported by async-profiler. Use the 'event' parameter to specify. Default is 'cpu'. Not all operating systems will support all types.

Perf events:

* cpu
* page-faults
* context-switches
* cycles
* instructions
* cache-references
* cache-misses
* branches
* branch-misses
* bus-cycles
* L1-dcache-load-misses
* LLC-load-misses
* dTLB-load-misses

Java events:

* alloc
* lock

The following output formats are supported. Use the 'output' parameter to specify. Default is 'flamegraph'.

Output formats:

* summary: A dump of basic profiling statistics.
* traces: Call traces.
* flat: Flat profile (top N hot methods).
* collapsed: Collapsed call traces in the format used by FlameGraph script. This is a collection of call stacks, where each line is a semicolon separated list of frames followed by a counter.
* svg: FlameGraph in SVG format.
* tree: Call tree in HTML format.
* jfr: Call traces in Java Flight Recorder format.

The 'duration' parameter specifies how long to collect trace data before generating output, specified in seconds. The default is 10 seconds.

## UI

In the UI, there is a new entry 'Profiler' in the top menu that will run the default action, which is to profile the CPU usage of the local process for thirty seconds and then produce FlameGraph SVG output.

## Notes

The query parameter \`pid\` can be used to specify the process id of a specific process to be profiled. If this parameter is missing the local process in which the infoserver is embedded will be profiled. Profile targets that are not JVMs might work but is not specifically supported. There are security implications. Access to the infoserver should be appropriately restricted.
`,i={title:"Profiler Servlet",description:"Integrated, on-demand profiling via the Async Profiler project."},a=[{href:"https://issues.apache.org/jira/browse/HBASE-21926"},{href:"https://github.com/jvm-profiling-tools/async-profiler"},{href:"https://github.com/jvm-profiling-tools/async-profiler"},{href:"https://github.com/jvm-profiling-tools/async-profiler#basic-usage"}],l={contents:[{heading:"profiler-background",content:`HBASE-21926 introduced a new servlet that
supports integrated, on-demand profiling via the
Async Profiler project.`},{heading:"profiler-prerequisites",content:`Go to the Async Profiler Home Page, download
a release appropriate for your platform, and install on every cluster host. If running a Linux
kernel v4.6 or later, be sure to set proc variables as per the
Basic Usage section. Not doing
so will result in flame graphs that contain no content.`},{heading:"profiler-prerequisites",content:`Set ASYNC_PROFILER_HOME in the environment (put it in hbase-env.sh) to the root directory of the
async-profiler install location, or pass it on the HBase daemon's command line as a system property
as -Dasync.profiler.home=/path/to/async-profiler.`},{heading:"profiler-usage",content:`Once the prerequisites are satisfied, access to async-profiler is available by way of the HBase UI
or direct interaction with the infoserver.`},{heading:"profiler-usage",content:"Examples:"},{heading:"profiler-usage",content:`To collect 30 second CPU profile of current process (returns FlameGraph svg)
curl http://localhost:16030/prof`},{heading:"profiler-usage",content:`To collect 1 minute CPU profile of current process and output in tree format (html)
curl http://localhost:16030/prof?output=tree&duration=60`},{heading:"profiler-usage",content:`To collect 30 second heap allocation profile of current process (returns FlameGraph svg)
curl http://localhost:16030/prof?event=alloc`},{heading:"profiler-usage",content:`To collect lock contention profile of current process (returns FlameGraph svg)
curl http://localhost:16030/prof?event=lock`},{heading:"profiler-usage",content:"The following event types are supported by async-profiler. Use the 'event' parameter to specify. Default is 'cpu'. Not all operating systems will support all types."},{heading:"profiler-usage",content:"Perf events:"},{heading:"profiler-usage",content:"cpu"},{heading:"profiler-usage",content:"page-faults"},{heading:"profiler-usage",content:"context-switches"},{heading:"profiler-usage",content:"cycles"},{heading:"profiler-usage",content:"instructions"},{heading:"profiler-usage",content:"cache-references"},{heading:"profiler-usage",content:"cache-misses"},{heading:"profiler-usage",content:"branches"},{heading:"profiler-usage",content:"branch-misses"},{heading:"profiler-usage",content:"bus-cycles"},{heading:"profiler-usage",content:"L1-dcache-load-misses"},{heading:"profiler-usage",content:"LLC-load-misses"},{heading:"profiler-usage",content:"dTLB-load-misses"},{heading:"profiler-usage",content:"Java events:"},{heading:"profiler-usage",content:"alloc"},{heading:"profiler-usage",content:"lock"},{heading:"profiler-usage",content:"The following output formats are supported. Use the 'output' parameter to specify. Default is 'flamegraph'."},{heading:"profiler-usage",content:"Output formats:"},{heading:"profiler-usage",content:"summary: A dump of basic profiling statistics."},{heading:"profiler-usage",content:"traces: Call traces."},{heading:"profiler-usage",content:"flat: Flat profile (top N hot methods)."},{heading:"profiler-usage",content:"collapsed: Collapsed call traces in the format used by FlameGraph script. This is a collection of call stacks, where each line is a semicolon separated list of frames followed by a counter."},{heading:"profiler-usage",content:"svg: FlameGraph in SVG format."},{heading:"profiler-usage",content:"tree: Call tree in HTML format."},{heading:"profiler-usage",content:"jfr: Call traces in Java Flight Recorder format."},{heading:"profiler-usage",content:"The 'duration' parameter specifies how long to collect trace data before generating output, specified in seconds. The default is 10 seconds."},{heading:"profiler-ui",content:"In the UI, there is a new entry 'Profiler' in the top menu that will run the default action, which is to profile the CPU usage of the local process for thirty seconds and then produce FlameGraph SVG output."},{heading:"profiler-notes",content:"The query parameter pid can be used to specify the process id of a specific process to be profiled. If this parameter is missing the local process in which the infoserver is embedded will be profiled. Profile targets that are not JVMs might work but is not specifically supported. There are security implications. Access to the infoserver should be appropriately restricted."}],headings:[{id:"profiler-background",content:"Background"},{id:"profiler-prerequisites",content:"Prerequisites"},{id:"profiler-usage",content:"Usage"},{id:"profiler-ui",content:"UI"},{id:"profiler-notes",content:"Notes"}]};const c=[{depth:2,url:"#profiler-background",title:e.jsx(e.Fragment,{children:"Background"})},{depth:2,url:"#profiler-prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#profiler-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:2,url:"#profiler-ui",title:e.jsx(e.Fragment,{children:"UI"})},{depth:2,url:"#profiler-notes",title:e.jsx(e.Fragment,{children:"Notes"})}];function n(r){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",ul:"ul",...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"profiler-background",children:"Background"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-21926",children:"HBASE-21926"}),` introduced a new servlet that
supports integrated, on-demand profiling via the
`,e.jsx(t.a,{href:"https://github.com/jvm-profiling-tools/async-profiler",children:"Async Profiler"})," project."]}),`
`,e.jsx(t.h2,{id:"profiler-prerequisites",children:"Prerequisites"}),`
`,e.jsxs(t.p,{children:["Go to the ",e.jsx(t.a,{href:"https://github.com/jvm-profiling-tools/async-profiler",children:"Async Profiler Home Page"}),`, download
a release appropriate for your platform, and install on every cluster host. If running a Linux
kernel v4.6 or later, be sure to set proc variables as per the
`,e.jsx(t.a,{href:"https://github.com/jvm-profiling-tools/async-profiler#basic-usage",children:"Basic Usage"}),` section. Not doing
so will result in flame graphs that contain no content.`]}),`
`,e.jsxs(t.p,{children:["Set ",e.jsx(t.code,{children:"ASYNC_PROFILER_HOME"}),` in the environment (put it in hbase-env.sh) to the root directory of the
async-profiler install location, or pass it on the HBase daemon's command line as a system property
as `,e.jsx(t.code,{children:"-Dasync.profiler.home=/path/to/async-profiler"}),"."]}),`
`,e.jsx(t.h2,{id:"profiler-usage",children:"Usage"}),`
`,e.jsx(t.p,{children:`Once the prerequisites are satisfied, access to async-profiler is available by way of the HBase UI
or direct interaction with the infoserver.`}),`
`,e.jsx(t.p,{children:"Examples:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[`To collect 30 second CPU profile of current process (returns FlameGraph svg)
`,e.jsx(t.code,{children:"curl http://localhost:16030/prof"})]}),`
`,e.jsxs(t.li,{children:[`To collect 1 minute CPU profile of current process and output in tree format (html)
`,e.jsx(t.code,{children:"curl http://localhost:16030/prof?output=tree&duration=60"})]}),`
`,e.jsxs(t.li,{children:[`To collect 30 second heap allocation profile of current process (returns FlameGraph svg)
`,e.jsx(t.code,{children:"curl http://localhost:16030/prof?event=alloc"})]}),`
`,e.jsxs(t.li,{children:[`To collect lock contention profile of current process (returns FlameGraph svg)
`,e.jsx(t.code,{children:"curl http://localhost:16030/prof?event=lock"})]}),`
`]}),`
`,e.jsx(t.p,{children:"The following event types are supported by async-profiler. Use the 'event' parameter to specify. Default is 'cpu'. Not all operating systems will support all types."}),`
`,e.jsx(t.p,{children:"Perf events:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"cpu"}),`
`,e.jsx(t.li,{children:"page-faults"}),`
`,e.jsx(t.li,{children:"context-switches"}),`
`,e.jsx(t.li,{children:"cycles"}),`
`,e.jsx(t.li,{children:"instructions"}),`
`,e.jsx(t.li,{children:"cache-references"}),`
`,e.jsx(t.li,{children:"cache-misses"}),`
`,e.jsx(t.li,{children:"branches"}),`
`,e.jsx(t.li,{children:"branch-misses"}),`
`,e.jsx(t.li,{children:"bus-cycles"}),`
`,e.jsx(t.li,{children:"L1-dcache-load-misses"}),`
`,e.jsx(t.li,{children:"LLC-load-misses"}),`
`,e.jsx(t.li,{children:"dTLB-load-misses"}),`
`]}),`
`,e.jsx(t.p,{children:"Java events:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"alloc"}),`
`,e.jsx(t.li,{children:"lock"}),`
`]}),`
`,e.jsx(t.p,{children:"The following output formats are supported. Use the 'output' parameter to specify. Default is 'flamegraph'."}),`
`,e.jsx(t.p,{children:"Output formats:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"summary: A dump of basic profiling statistics."}),`
`,e.jsx(t.li,{children:"traces: Call traces."}),`
`,e.jsx(t.li,{children:"flat: Flat profile (top N hot methods)."}),`
`,e.jsx(t.li,{children:"collapsed: Collapsed call traces in the format used by FlameGraph script. This is a collection of call stacks, where each line is a semicolon separated list of frames followed by a counter."}),`
`,e.jsx(t.li,{children:"svg: FlameGraph in SVG format."}),`
`,e.jsx(t.li,{children:"tree: Call tree in HTML format."}),`
`,e.jsx(t.li,{children:"jfr: Call traces in Java Flight Recorder format."}),`
`]}),`
`,e.jsx(t.p,{children:"The 'duration' parameter specifies how long to collect trace data before generating output, specified in seconds. The default is 10 seconds."}),`
`,e.jsx(t.h2,{id:"profiler-ui",children:"UI"}),`
`,e.jsx(t.p,{children:"In the UI, there is a new entry 'Profiler' in the top menu that will run the default action, which is to profile the CPU usage of the local process for thirty seconds and then produce FlameGraph SVG output."}),`
`,e.jsx(t.h2,{id:"profiler-notes",children:"Notes"}),`
`,e.jsxs(t.p,{children:["The query parameter ",e.jsx(t.code,{children:"pid"})," can be used to specify the process id of a specific process to be profiled. If this parameter is missing the local process in which the infoserver is embedded will be profiled. Profile targets that are not JVMs might work but is not specifically supported. There are security implications. Access to the infoserver should be appropriately restricted."]})]})}function p(r={}){const{wrapper:t}=r.components||{};return t?e.jsx(t,{...r,children:e.jsx(n,{...r})}):n(r)}export{s as _markdown,p as default,a as extractedReferences,i as frontmatter,l as structuredData,c as toc};
