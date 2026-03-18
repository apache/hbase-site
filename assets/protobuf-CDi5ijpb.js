import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`## Protobuf

HBase uses Google's [protobufs](https://developers.google.com/protocol-buffers/) wherever
it persists metadata — in the tail of hfiles or Cells written by
HBase into the system hbase:meta table or when HBase writes znodes
to zookeeper, etc. — and when it passes objects over the wire making
[RPCs](/docs/rpc). HBase uses protobufs to describe the RPC
Interfaces (Services) we expose to clients, for example the \`Admin\` and \`Client\`
Interfaces that the RegionServer fields,
or specifying the arbitrary extensions added by developers via our
[Coprocessor Endpoint](/docs/cp) mechanism.

With protobuf, you describe serializations and services in a \`.protos\` file.
You then feed these descriptors to a protobuf tool, the \`protoc\` binary,
to generate classes that can marshall and unmarshall the described serializations
and field the specified Services.

See the \`README.txt\` in the HBase sub-modules for details on how
to run the class generation on a per-module basis;
e.g. see \`hbase-protocol/README.txt\` for how to generate protobuf classes
in the hbase-protocol module.

In HBase, \`.proto\` files are either in the \`hbase-protocol\` module; a module
dedicated to hosting the common proto files and the protoc generated classes
that HBase uses internally serializing metadata. For extensions to hbase
such as REST or Coprocessor Endpoints that need their own descriptors; their
protos are located inside the function's hosting module: e.g. \`hbase-rest\`
is home to the REST proto files and the \`hbase-rsgroup\` table grouping
Coprocessor Endpoint has all protos that have to do with table grouping.

Protos are hosted by the module that makes use of them. While
this makes it so generation of protobuf classes is distributed, done
per module, we do it this way so modules encapsulate all to do with
the functionality they bring to hbase.

Extensions whether REST or Coprocessor Endpoints will make use
of core HBase protos found back in the hbase-protocol module. They'll
use these core protos when they want to serialize a Cell or a Put or
refer to a particular node via ServerName, etc., as part of providing the
CPEP Service. Going forward, after the release of hbase-2.0.0, this
practice needs to whither. We'll explain why in the later
[hbase-2.0.0](/docs/protobuf#hbase-200-and-the-shading-of-protobufs-hbase-15638) section.

### hbase-2.0.0 and the shading of protobufs (HBASE-15638)

As of hbase-2.0.0, our protobuf usage gets a little more involved. HBase
core protobuf references are offset so as to refer to a private,
bundled protobuf. Core stops referring to protobuf
classes at com.google.protobuf.\\_ and instead references protobuf at
the HBase-specific offset
org.apache.hadoop.hbase.shaded.com.google.protobuf.\\_. We do this indirection
so hbase core can evolve its protobuf version independent of whatever our
dependencies rely on. For instance, HDFS serializes using protobuf.
HDFS is on our CLASSPATH. Without the above described indirection, our
protobuf versions would have to align. HBase would be stuck
on the HDFS protobuf version until HDFS decided to upgrade. HBase
and HDFS versions would be tied.

We had to move on from protobuf-2.5.0 because we need facilities
added in protobuf-3.1.0; in particular being able to save on
copies and avoiding bringing protobufs onheap for
serialization/deserialization.

In hbase-2.0.0, we introduced a new module, \`hbase-protocol-shaded\`
inside which we contained all to do with protobuf and its subsequent
relocation/shading. This module is in essence a copy of much of the old
\`hbase-protocol\` but with an extra shading/relocation step.
Core was moved to depend on this new module.

That said, a complication arises around Coprocessor Endpoints (CPEPs).
CPEPs depend on public HBase APIs that reference protobuf classes at
\`com.google.protobuf.*\` explicitly. For example, in our Table Interface
we have the below as the means by which you obtain a CPEP Service
to make invocations against:

\`\`\`java
...
  <T extends com.google.protobuf.Service,R> Map<byte[],R> coprocessorService(
   Class<T> service, byte[] startKey, byte[] endKey,
     org.apache.hadoop.hbase.client.coprocessor.Batch.Call<T,R> callable)
  throws com.google.protobuf.ServiceException, Throwable
\`\`\`

Existing CPEPs will have made reference to core HBase protobufs
specifying ServerNames or carrying Mutations.
So as to continue being able to service CPEPs and their references
to \`com.google.protobuf.*\` across the upgrade to hbase-2.0.0 and beyond,
HBase needs to be able to deal with both
\`com.google.protobuf.*\` references and its internal offset
\`org.apache.hadoop.hbase.shaded.com.google.protobuf.*\` protobufs.

The \`hbase-protocol-shaded\` module hosts all
protobufs used by HBase core.

But for the vestigial CPEP references to the (non-shaded) content of
\`hbase-protocol\`, we keep around most of this module going forward
just so it is available to CPEPs. Retaining the most of \`hbase-protocol\`
makes for overlapping, 'duplicated' proto instances where some exist as
non-shaded/non-relocated here in their old module
location but also in the new location, shaded under
\`hbase-protocol-shaded\`. In other words, there is an instance
of the generated protobuf class
\`org.apache.hadoop.hbase.protobuf.generated.ServerName\`
in hbase-protocol and another generated instance that is the same in all
regards except its protobuf references are to the internal shaded
version at \`org.apache.hadoop.hbase.shaded.protobuf.generated.ServerName\`
(note the 'shaded' addition in the middle of the package name).

If you extend a proto in \`hbase-protocol-shaded\` for internal use,
consider extending it also in
\`hbase-protocol\` (and regenerating).

Going forward, we will provide a new module of common types for use
by CPEPs that will have the same guarantees against change as does our
public API. TODO.

### protobuf changes for hbase-3.0.0 (HBASE-23797)

Since hadoop(start from 3.3.x) also shades protobuf and bumps the version to
3.x, there is no reason for us to stay on protobuf 2.5.0 any more.

In HBase 3.0.0, the hbase-protocol module has been purged, the CPEP
implementation should use the protos in hbase-protocol-shaded module, and also
make use of the shaded protobuf in hbase-thirdparty. In general, we will keep
the protobuf version compatible for a whole major release, unless there are
critical problems, for example, a critical CVE on protobuf.

Add this dependency to your pom:

\`\`\`xml
<dependency>
  <groupId>org.apache.hbase.thirdparty</groupId>
  <artifactId>hbase-shaded-protobuf</artifactId>
  <!-- use the version that your target hbase cluster uses -->
  <version>\${hbase-thirdparty.version}</version>
  <scope>provided</scope>
</dependency>
\`\`\`

And typically you also need to add this plugin to your pom to make your
generated protobuf code also use the shaded and relocated protobuf version
in hbase-thirdparty.

\`\`\`xml
<plugin>
  <groupId>com.google.code.maven-replacer-plugin</groupId>
  <artifactId>replacer</artifactId>
  <version>1.5.3</version>
  <executions>
    <execution>
      <phase>process-sources</phase>
      <goals>
        <goal>replace</goal>
      </goals>
    </execution>
  </executions>
  <configuration>
    <basedir>\${basedir}/target/generated-sources/</basedir>
      <includes>
        <include>**/*.java</include>
      </includes>
      <!-- Ignore errors when missing files, because it means this build
           was run with -Dprotoc.skip and there is no -Dreplacer.skip -->
      <ignoreErrors>true</ignoreErrors>
      <replacements>
        <replacement>
          <token>([^\\.])com.google.protobuf</token>
          <value>$1org.apache.hbase.thirdparty.com.google.protobuf</value>
        </replacement>
        <replacement>
          <token>(public)(\\W+static)?(\\W+final)?(\\W+class)</token>
          <value>@javax.annotation.Generated("proto") $1$2$3$4</value>
        </replacement>
        <!-- replacer doesn't support anchoring or negative lookbehind -->
        <replacement>
          <token>(@javax.annotation.Generated\\("proto"\\) ){2}</token>
          <value>$1</value>
        </replacement>
      </replacements>
  </configuration>
</plugin>
\`\`\`

In hbase-examples module, we have some examples under the
\`org.apache.hadoop.hbase.coprocessor.example\` package. You can see
\`BulkDeleteEndpoint\` and \`BulkDelete.proto\` for more details, and you can also
check the \`pom.xml\` of hbase-examples module to see how to make use of the above
plugin.
`,t={title:"Protobuf in HBase",description:"Detailed guide on how HBase uses Protocol Buffers for serialization, RPC interfaces, and coprocessor endpoints, including shading and versioning considerations."},r=[{href:"https://developers.google.com/protocol-buffers/"},{href:"/docs/rpc"},{href:"/docs/cp"},{href:"/docs/protobuf#hbase-200-and-the-shading-of-protobufs-hbase-15638"}],h={contents:[{heading:"protobuf-overview",content:`HBase uses Google's protobufs wherever
it persists metadata — in the tail of hfiles or Cells written by
HBase into the system hbase:meta table or when HBase writes znodes
to zookeeper, etc. — and when it passes objects over the wire making
RPCs. HBase uses protobufs to describe the RPC
Interfaces (Services) we expose to clients, for example the Admin and Client
Interfaces that the RegionServer fields,
or specifying the arbitrary extensions added by developers via our
Coprocessor Endpoint mechanism.`},{heading:"protobuf-overview",content:`With protobuf, you describe serializations and services in a .protos file.
You then feed these descriptors to a protobuf tool, the protoc binary,
to generate classes that can marshall and unmarshall the described serializations
and field the specified Services.`},{heading:"protobuf-overview",content:`See the README.txt in the HBase sub-modules for details on how
to run the class generation on a per-module basis;
e.g. see hbase-protocol/README.txt for how to generate protobuf classes
in the hbase-protocol module.`},{heading:"protobuf-overview",content:`In HBase, .proto files are either in the hbase-protocol module; a module
dedicated to hosting the common proto files and the protoc generated classes
that HBase uses internally serializing metadata. For extensions to hbase
such as REST or Coprocessor Endpoints that need their own descriptors; their
protos are located inside the function's hosting module: e.g. hbase-rest
is home to the REST proto files and the hbase-rsgroup table grouping
Coprocessor Endpoint has all protos that have to do with table grouping.`},{heading:"protobuf-overview",content:`Protos are hosted by the module that makes use of them. While
this makes it so generation of protobuf classes is distributed, done
per module, we do it this way so modules encapsulate all to do with
the functionality they bring to hbase.`},{heading:"protobuf-overview",content:`Extensions whether REST or Coprocessor Endpoints will make use
of core HBase protos found back in the hbase-protocol module. They'll
use these core protos when they want to serialize a Cell or a Put or
refer to a particular node via ServerName, etc., as part of providing the
CPEP Service. Going forward, after the release of hbase-2.0.0, this
practice needs to whither. We'll explain why in the later
hbase-2.0.0 section.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`As of hbase-2.0.0, our protobuf usage gets a little more involved. HBase
core protobuf references are offset so as to refer to a private,
bundled protobuf. Core stops referring to protobuf
classes at com.google.protobuf._ and instead references protobuf at
the HBase-specific offset
org.apache.hadoop.hbase.shaded.com.google.protobuf._. We do this indirection
so hbase core can evolve its protobuf version independent of whatever our
dependencies rely on. For instance, HDFS serializes using protobuf.
HDFS is on our CLASSPATH. Without the above described indirection, our
protobuf versions would have to align. HBase would be stuck
on the HDFS protobuf version until HDFS decided to upgrade. HBase
and HDFS versions would be tied.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`We had to move on from protobuf-2.5.0 because we need facilities
added in protobuf-3.1.0; in particular being able to save on
copies and avoiding bringing protobufs onheap for
serialization/deserialization.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`In hbase-2.0.0, we introduced a new module, hbase-protocol-shaded
inside which we contained all to do with protobuf and its subsequent
relocation/shading. This module is in essence a copy of much of the old
hbase-protocol but with an extra shading/relocation step.
Core was moved to depend on this new module.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`That said, a complication arises around Coprocessor Endpoints (CPEPs).
CPEPs depend on public HBase APIs that reference protobuf classes at
com.google.protobuf.* explicitly. For example, in our Table Interface
we have the below as the means by which you obtain a CPEP Service
to make invocations against:`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`Existing CPEPs will have made reference to core HBase protobufs
specifying ServerNames or carrying Mutations.
So as to continue being able to service CPEPs and their references
to com.google.protobuf.* across the upgrade to hbase-2.0.0 and beyond,
HBase needs to be able to deal with both
com.google.protobuf.* references and its internal offset
org.apache.hadoop.hbase.shaded.com.google.protobuf.* protobufs.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`The hbase-protocol-shaded module hosts all
protobufs used by HBase core.`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`But for the vestigial CPEP references to the (non-shaded) content of
hbase-protocol, we keep around most of this module going forward
just so it is available to CPEPs. Retaining the most of hbase-protocol
makes for overlapping, 'duplicated' proto instances where some exist as
non-shaded/non-relocated here in their old module
location but also in the new location, shaded under
hbase-protocol-shaded. In other words, there is an instance
of the generated protobuf class
org.apache.hadoop.hbase.protobuf.generated.ServerName
in hbase-protocol and another generated instance that is the same in all
regards except its protobuf references are to the internal shaded
version at org.apache.hadoop.hbase.shaded.protobuf.generated.ServerName
(note the 'shaded' addition in the middle of the package name).`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`If you extend a proto in hbase-protocol-shaded for internal use,
consider extending it also in
hbase-protocol (and regenerating).`},{heading:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:`Going forward, we will provide a new module of common types for use
by CPEPs that will have the same guarantees against change as does our
public API. TODO.`},{heading:"protobuf-changes-for-hbase-300-hbase-23797",content:`Since hadoop(start from 3.3.x) also shades protobuf and bumps the version to
3.x, there is no reason for us to stay on protobuf 2.5.0 any more.`},{heading:"protobuf-changes-for-hbase-300-hbase-23797",content:`In HBase 3.0.0, the hbase-protocol module has been purged, the CPEP
implementation should use the protos in hbase-protocol-shaded module, and also
make use of the shaded protobuf in hbase-thirdparty. In general, we will keep
the protobuf version compatible for a whole major release, unless there are
critical problems, for example, a critical CVE on protobuf.`},{heading:"protobuf-changes-for-hbase-300-hbase-23797",content:"Add this dependency to your pom:"},{heading:"protobuf-changes-for-hbase-300-hbase-23797",content:`And typically you also need to add this plugin to your pom to make your
generated protobuf code also use the shaded and relocated protobuf version
in hbase-thirdparty.`},{heading:"protobuf-changes-for-hbase-300-hbase-23797",content:`In hbase-examples module, we have some examples under the
org.apache.hadoop.hbase.coprocessor.example package. You can see
BulkDeleteEndpoint and BulkDelete.proto for more details, and you can also
check the pom.xml of hbase-examples module to see how to make use of the above
plugin.`}],headings:[{id:"protobuf-overview",content:"Protobuf"},{id:"hbase-200-and-the-shading-of-protobufs-hbase-15638",content:"hbase-2.0.0 and the shading of protobufs (HBASE-15638)"},{id:"protobuf-changes-for-hbase-300-hbase-23797",content:"protobuf changes for hbase-3.0.0 (HBASE-23797)"}]};const l=[{depth:2,url:"#protobuf-overview",title:e.jsx(e.Fragment,{children:"Protobuf"})},{depth:3,url:"#hbase-200-and-the-shading-of-protobufs-hbase-15638",title:e.jsx(e.Fragment,{children:"hbase-2.0.0 and the shading of protobufs (HBASE-15638)"})},{depth:3,url:"#protobuf-changes-for-hbase-300-hbase-23797",title:e.jsx(e.Fragment,{children:"protobuf changes for hbase-3.0.0 (HBASE-23797)"})}];function n(i){const s={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"protobuf-overview",children:"Protobuf"}),`
`,e.jsxs(s.p,{children:["HBase uses Google's ",e.jsx(s.a,{href:"https://developers.google.com/protocol-buffers/",children:"protobufs"}),` wherever
it persists metadata — in the tail of hfiles or Cells written by
HBase into the system hbase:meta table or when HBase writes znodes
to zookeeper, etc. — and when it passes objects over the wire making
`,e.jsx(s.a,{href:"/docs/rpc",children:"RPCs"}),`. HBase uses protobufs to describe the RPC
Interfaces (Services) we expose to clients, for example the `,e.jsx(s.code,{children:"Admin"})," and ",e.jsx(s.code,{children:"Client"}),`
Interfaces that the RegionServer fields,
or specifying the arbitrary extensions added by developers via our
`,e.jsx(s.a,{href:"/docs/cp",children:"Coprocessor Endpoint"})," mechanism."]}),`
`,e.jsxs(s.p,{children:["With protobuf, you describe serializations and services in a ",e.jsx(s.code,{children:".protos"}),` file.
You then feed these descriptors to a protobuf tool, the `,e.jsx(s.code,{children:"protoc"}),` binary,
to generate classes that can marshall and unmarshall the described serializations
and field the specified Services.`]}),`
`,e.jsxs(s.p,{children:["See the ",e.jsx(s.code,{children:"README.txt"}),` in the HBase sub-modules for details on how
to run the class generation on a per-module basis;
e.g. see `,e.jsx(s.code,{children:"hbase-protocol/README.txt"}),` for how to generate protobuf classes
in the hbase-protocol module.`]}),`
`,e.jsxs(s.p,{children:["In HBase, ",e.jsx(s.code,{children:".proto"})," files are either in the ",e.jsx(s.code,{children:"hbase-protocol"}),` module; a module
dedicated to hosting the common proto files and the protoc generated classes
that HBase uses internally serializing metadata. For extensions to hbase
such as REST or Coprocessor Endpoints that need their own descriptors; their
protos are located inside the function's hosting module: e.g. `,e.jsx(s.code,{children:"hbase-rest"}),`
is home to the REST proto files and the `,e.jsx(s.code,{children:"hbase-rsgroup"}),` table grouping
Coprocessor Endpoint has all protos that have to do with table grouping.`]}),`
`,e.jsx(s.p,{children:`Protos are hosted by the module that makes use of them. While
this makes it so generation of protobuf classes is distributed, done
per module, we do it this way so modules encapsulate all to do with
the functionality they bring to hbase.`}),`
`,e.jsxs(s.p,{children:[`Extensions whether REST or Coprocessor Endpoints will make use
of core HBase protos found back in the hbase-protocol module. They'll
use these core protos when they want to serialize a Cell or a Put or
refer to a particular node via ServerName, etc., as part of providing the
CPEP Service. Going forward, after the release of hbase-2.0.0, this
practice needs to whither. We'll explain why in the later
`,e.jsx(s.a,{href:"/docs/protobuf#hbase-200-and-the-shading-of-protobufs-hbase-15638",children:"hbase-2.0.0"})," section."]}),`
`,e.jsx(s.h3,{id:"hbase-200-and-the-shading-of-protobufs-hbase-15638",children:"hbase-2.0.0 and the shading of protobufs (HBASE-15638)"}),`
`,e.jsx(s.p,{children:`As of hbase-2.0.0, our protobuf usage gets a little more involved. HBase
core protobuf references are offset so as to refer to a private,
bundled protobuf. Core stops referring to protobuf
classes at com.google.protobuf._ and instead references protobuf at
the HBase-specific offset
org.apache.hadoop.hbase.shaded.com.google.protobuf._. We do this indirection
so hbase core can evolve its protobuf version independent of whatever our
dependencies rely on. For instance, HDFS serializes using protobuf.
HDFS is on our CLASSPATH. Without the above described indirection, our
protobuf versions would have to align. HBase would be stuck
on the HDFS protobuf version until HDFS decided to upgrade. HBase
and HDFS versions would be tied.`}),`
`,e.jsx(s.p,{children:`We had to move on from protobuf-2.5.0 because we need facilities
added in protobuf-3.1.0; in particular being able to save on
copies and avoiding bringing protobufs onheap for
serialization/deserialization.`}),`
`,e.jsxs(s.p,{children:["In hbase-2.0.0, we introduced a new module, ",e.jsx(s.code,{children:"hbase-protocol-shaded"}),`
inside which we contained all to do with protobuf and its subsequent
relocation/shading. This module is in essence a copy of much of the old
`,e.jsx(s.code,{children:"hbase-protocol"}),` but with an extra shading/relocation step.
Core was moved to depend on this new module.`]}),`
`,e.jsxs(s.p,{children:[`That said, a complication arises around Coprocessor Endpoints (CPEPs).
CPEPs depend on public HBase APIs that reference protobuf classes at
`,e.jsx(s.code,{children:"com.google.protobuf.*"}),` explicitly. For example, in our Table Interface
we have the below as the means by which you obtain a CPEP Service
to make invocations against:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T extends com.google.protobuf.Service,R"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Map"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[],R"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" coprocessorService"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   Class"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" service, "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] startKey, "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] endKey,"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"     org.apache.hadoop.hbase.client.coprocessor.Batch.Call"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T,R"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" callable)"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  throws com.google.protobuf.ServiceException, Throwable"})})]})})}),`
`,e.jsxs(s.p,{children:[`Existing CPEPs will have made reference to core HBase protobufs
specifying ServerNames or carrying Mutations.
So as to continue being able to service CPEPs and their references
to `,e.jsx(s.code,{children:"com.google.protobuf.*"}),` across the upgrade to hbase-2.0.0 and beyond,
HBase needs to be able to deal with both
`,e.jsx(s.code,{children:"com.google.protobuf.*"}),` references and its internal offset
`,e.jsx(s.code,{children:"org.apache.hadoop.hbase.shaded.com.google.protobuf.*"})," protobufs."]}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"hbase-protocol-shaded"}),` module hosts all
protobufs used by HBase core.`]}),`
`,e.jsxs(s.p,{children:[`But for the vestigial CPEP references to the (non-shaded) content of
`,e.jsx(s.code,{children:"hbase-protocol"}),`, we keep around most of this module going forward
just so it is available to CPEPs. Retaining the most of `,e.jsx(s.code,{children:"hbase-protocol"}),`
makes for overlapping, 'duplicated' proto instances where some exist as
non-shaded/non-relocated here in their old module
location but also in the new location, shaded under
`,e.jsx(s.code,{children:"hbase-protocol-shaded"}),`. In other words, there is an instance
of the generated protobuf class
`,e.jsx(s.code,{children:"org.apache.hadoop.hbase.protobuf.generated.ServerName"}),`
in hbase-protocol and another generated instance that is the same in all
regards except its protobuf references are to the internal shaded
version at `,e.jsx(s.code,{children:"org.apache.hadoop.hbase.shaded.protobuf.generated.ServerName"}),`
(note the 'shaded' addition in the middle of the package name).`]}),`
`,e.jsxs(s.p,{children:["If you extend a proto in ",e.jsx(s.code,{children:"hbase-protocol-shaded"}),` for internal use,
consider extending it also in
`,e.jsx(s.code,{children:"hbase-protocol"})," (and regenerating)."]}),`
`,e.jsx(s.p,{children:`Going forward, we will provide a new module of common types for use
by CPEPs that will have the same guarantees against change as does our
public API. TODO.`}),`
`,e.jsx(s.h3,{id:"protobuf-changes-for-hbase-300-hbase-23797",children:"protobuf changes for hbase-3.0.0 (HBASE-23797)"}),`
`,e.jsx(s.p,{children:`Since hadoop(start from 3.3.x) also shades protobuf and bumps the version to
3.x, there is no reason for us to stay on protobuf 2.5.0 any more.`}),`
`,e.jsx(s.p,{children:`In HBase 3.0.0, the hbase-protocol module has been purged, the CPEP
implementation should use the protos in hbase-protocol-shaded module, and also
make use of the shaded protobuf in hbase-thirdparty. In general, we will keep
the protobuf version compatible for a whole major release, unless there are
critical problems, for example, a critical CVE on protobuf.`}),`
`,e.jsx(s.p,{children:"Add this dependency to your pom:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hbase.thirdparty</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase-shaded-protobuf</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  <!-- use the version that your target hbase cluster uses -->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">${hbase-thirdparty.version}</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"scope"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">provided</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"scope"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(s.p,{children:`And typically you also need to add this plugin to your pom to make your
generated protobuf code also use the shaded and relocated protobuf version
in hbase-thirdparty.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"plugin"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">com.google.code.maven-replacer-plugin</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">replacer</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">1.5.3</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"executions"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"execution"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"phase"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">process-sources</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"phase"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"goals"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"goal"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">replace</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"goal"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"goals"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"execution"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"executions"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"basedir"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">${basedir}/target/generated-sources/</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"basedir"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"includes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">**/*.java</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"includes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      <!-- Ignore errors when missing files, because it means this build"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"           was run with -Dprotoc.skip and there is no -Dreplacer.skip -->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"ignoreErrors"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">true</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"ignoreErrors"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacements"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">([^\\.])com.google.protobuf</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">$1org.apache.hbase.thirdparty.com.google.protobuf</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">(public)(\\W+static)?(\\W+final)?(\\W+class)</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'>@javax.annotation.Generated("proto") $1$2$3$4</'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        <!-- replacer doesn't support anchoring or negative lookbehind -->"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'>(@javax.annotation.Generated\\("proto"\\) ){2}</'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"token"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">$1</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacement"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"replacements"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"plugin"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(s.p,{children:[`In hbase-examples module, we have some examples under the
`,e.jsx(s.code,{children:"org.apache.hadoop.hbase.coprocessor.example"}),` package. You can see
`,e.jsx(s.code,{children:"BulkDeleteEndpoint"})," and ",e.jsx(s.code,{children:"BulkDelete.proto"}),` for more details, and you can also
check the `,e.jsx(s.code,{children:"pom.xml"}),` of hbase-examples module to see how to make use of the above
plugin.`]})]})}function d(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{a as _markdown,d as default,r as extractedReferences,t as frontmatter,h as structuredData,l as toc};
