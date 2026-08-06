import{j as e}from"./components-BCHf_v1I.js";let s=`## Overview

The basic support for tracing has been done, where we added tracing for async client, rpc, region read/write/scan operation, and WAL. We use opentelemetry-api to implement the tracing support manually by code, as our code base is way too complicated to be instrumented through a java agent. But notice that you still need to attach the opentelemetry java agent to enable tracing. Please see the official site for [OpenTelemetry](https://opentelemetry.io/) and the documentation for [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) for more details on how to properly configure opentelemetry instrumentation.

## Usage

### Enable Tracing

See this section in hbase-env.sh

\`\`\`
# Uncomment to enable trace, you can change the options to use other exporters such as jaeger or
# zipkin. See https://github.com/open-telemetry/opentelemetry-java-instrumentation on how to
# configure exporters and other components through system properties.
# export HBASE_TRACE_OPTS="-Dotel.resource.attributes=service.name=HBase -Dotel.traces.exporter=logging otel.metrics.exporter=none"
\`\`\`

Uncomment this line to enable tracing. The default config is to output the tracing data to log. Please see the documentation for [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) for more details on how to export tracing data to other tracing system such as OTel collector, jaeger or zipkin, what does the *service.name* mean, and how to change the sampling rate, etc.

<Callout type="info">
  The
  [LoggingSpanExporter](https://github.com/open-telemetry/opentelemetry-java/blob/v1.0.1/exporters/logging/src/main/java/io/opentelemetry/exporter/logging/LoggingSpanExporter.java)
  uses java.util.logging(jul) for logging tracing data, and the logger is initialized in
  opentelemetry java agent, which seems to be ahead of our jul to slf4j bridge initialization, so it
  will always log the tracing data to console. We highly suggest that you use other tracing systems
  to collect and view tracing data instead of logging.
</Callout>

### Performance Impact

According to the result in [HBASE-25658](https://issues.apache.org/jira/browse/HBASE-25658), the performance impact is minimal. Of course the test cluster is not under heavy load, so if you find out that enabling tracing would impact the performance, try to lower the sampling rate. See documentation for configuring [sampler](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#sampler) for more details.
`,l={title:"Tracing",description:"HBase used to depend on the HTrace project for tracing. After the Apache HTrace project moved to the Attic/retired, we decided to move to OpenTelemetry in HBASE-22120."},c=[{href:"https://opentelemetry.io/"},{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation"},{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation"},{href:"https://github.com/open-telemetry/opentelemetry-java/blob/v1.0.1/exporters/logging/src/main/java/io/opentelemetry/exporter/logging/LoggingSpanExporter.java"},{href:"https://issues.apache.org/jira/browse/HBASE-25658"},{href:"https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#sampler"}],h={contents:[{heading:"tracing-overview",content:"The basic support for tracing has been done, where we added tracing for async client, rpc, region read/write/scan operation, and WAL. We use opentelemetry-api to implement the tracing support manually by code, as our code base is way too complicated to be instrumented through a java agent. But notice that you still need to attach the opentelemetry java agent to enable tracing. Please see the official site for OpenTelemetry and the documentation for opentelemetry-java-instrumentation for more details on how to properly configure opentelemetry instrumentation."},{heading:"enable-tracing",content:"See this section in hbase-env.sh"},{heading:"enable-tracing",content:"Uncomment this line to enable tracing. The default config is to output the tracing data to log. Please see the documentation for opentelemetry-java-instrumentation for more details on how to export tracing data to other tracing system such as OTel collector, jaeger or zipkin, what does the *service.name* mean, and how to change the sampling rate, etc."},{heading:"enable-tracing",content:`The
LoggingSpanExporter
uses java.util.logging(jul) for logging tracing data, and the logger is initialized in
opentelemetry java agent, which seems to be ahead of our jul to slf4j bridge initialization, so it
will always log the tracing data to console. We highly suggest that you use other tracing systems
to collect and view tracing data instead of logging.`},{heading:"performance-impact",content:"According to the result in HBASE-25658, the performance impact is minimal. Of course the test cluster is not under heavy load, so if you find out that enabling tracing would impact the performance, try to lower the sampling rate. See documentation for configuring sampler for more details."}],headings:[{id:"tracing-overview",content:"Overview"},{id:"tracing-usage",content:"Usage"},{id:"enable-tracing",content:"Enable Tracing"},{id:"performance-impact",content:"Performance Impact"}]},g=[{depth:2,url:"#tracing-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:2,url:"#tracing-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#enable-tracing",title:e.jsx(e.Fragment,{children:"Enable Tracing"})},{depth:3,url:"#performance-impact",title:e.jsx(e.Fragment,{children:"Performance Impact"})}];function a(n){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",...n.components},{Callout:o}=t;return o||r("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"tracing-overview",children:"Overview"}),`
`,e.jsxs(t.p,{children:["The basic support for tracing has been done, where we added tracing for async client, rpc, region read/write/scan operation, and WAL. We use opentelemetry-api to implement the tracing support manually by code, as our code base is way too complicated to be instrumented through a java agent. But notice that you still need to attach the opentelemetry java agent to enable tracing. Please see the official site for ",e.jsx(t.a,{href:"https://opentelemetry.io/",children:"OpenTelemetry"})," and the documentation for ",e.jsx(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation",children:"opentelemetry-java-instrumentation"})," for more details on how to properly configure opentelemetry instrumentation."]}),`
`,e.jsx(t.h2,{id:"tracing-usage",children:"Usage"}),`
`,e.jsx(t.h3,{id:"enable-tracing",children:"Enable Tracing"}),`
`,e.jsx(t.p,{children:"See this section in hbase-env.sh"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"# Uncomment to enable trace, you can change the options to use other exporters such as jaeger or"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"# zipkin. See https://github.com/open-telemetry/opentelemetry-java-instrumentation on how to"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"# configure exporters and other components through system properties."})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:'# export HBASE_TRACE_OPTS="-Dotel.resource.attributes=service.name=HBase -Dotel.traces.exporter=logging otel.metrics.exporter=none"'})})]})})}),`
`,e.jsxs(t.p,{children:["Uncomment this line to enable tracing. The default config is to output the tracing data to log. Please see the documentation for ",e.jsx(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java-instrumentation",children:"opentelemetry-java-instrumentation"})," for more details on how to export tracing data to other tracing system such as OTel collector, jaeger or zipkin, what does the ",e.jsx(t.em,{children:"service.name"})," mean, and how to change the sampling rate, etc."]}),`
`,e.jsx(o,{type:"info",children:e.jsxs(t.p,{children:[`The
`,e.jsx(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java/blob/v1.0.1/exporters/logging/src/main/java/io/opentelemetry/exporter/logging/LoggingSpanExporter.java",children:"LoggingSpanExporter"}),`
uses java.util.logging(jul) for logging tracing data, and the logger is initialized in
opentelemetry java agent, which seems to be ahead of our jul to slf4j bridge initialization, so it
will always log the tracing data to console. We highly suggest that you use other tracing systems
to collect and view tracing data instead of logging.`]})}),`
`,e.jsx(t.h3,{id:"performance-impact",children:"Performance Impact"}),`
`,e.jsxs(t.p,{children:["According to the result in ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-25658",children:"HBASE-25658"}),", the performance impact is minimal. Of course the test cluster is not under heavy load, so if you find out that enabling tracing would impact the performance, try to lower the sampling rate. See documentation for configuring ",e.jsx(t.a,{href:"https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#sampler",children:"sampler"})," for more details."]})]})}function m(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function r(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{s as _markdown,m as default,c as extractedReferences,l as frontmatter,h as structuredData,g as toc};
