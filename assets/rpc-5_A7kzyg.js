import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let r=`In 0.95, all client/server communication is done with [protobuf'ed](https://developers.google.com/protocol-buffers/) Messages rather than with [Hadoop Writables](https://hadoop.apache.org/docs/current/api/org/apache/hadoop/io/Writable.html).
Our RPC wire format therefore changes.
This document describes the client/server request/response protocol and our new RPC wire-format.

For what RPC is like in 0.94 and previous, see Benoît/Tsuna's [Unofficial Hadoop / HBase RPC protocol documentation](https://github.com/OpenTSDB/asynchbase/blob/master/src/HBaseRpc.java#L164).
For more background on how we arrived at this spec., see [HBase RPC: WIP](https://docs.google.com/document/d/1WCKwgaLDqBw2vpux0jPsAu2WPTRISob7HGCO8YhfDTA/edit#)

## Goals

1. A wire-format we can evolve
2. A format that does not require our rewriting server core or radically changing its current architecture (for later).

## TODO

1. List of problems with currently specified format and where we would like to go in a version2, etc.
   For example, what would we have to change if anything to move server async or to support streaming/chunking?
2. Diagram on how it works
3. A grammar that succinctly describes the wire-format.
   Currently we have these words and the content of the rpc protobuf idl but a grammar for the back and forth would help with groking rpc.
   Also, a little state machine on client/server interactions would help with understanding (and ensuring correct implementation).

## RPC

The client will send setup information on connection establish.
Thereafter, the client invokes methods against the remote server sending a protobuf Message and receiving a protobuf Message in response.
Communication is synchronous.
All back and forth is preceded by an int that has the total length of the request/response.
Optionally, Cells(KeyValues) can be passed outside of protobufs in follow-behind Cell blocks
(because [we can't protobuf megabytes of KeyValues](https://docs.google.com/document/d/1WEtrq-JTIUhlnlnvA0oYRLp0F8MKpEBeBSCFcQiacdw/edit#) or Cells). These CellBlocks are encoded and optionally compressed.

For more detail on the protobufs involved, see the
[RPC.proto](https://github.com/apache/hbase/blob/master/hbase-protocol-shaded/src/main/protobuf/rpc/RPC.proto) file in master.

### Connection Setup

Client initiates connection.

#### Client

On connection setup, client sends a preamble followed by a connection header.

\`<preamble>\`

\`\`\`text
<MAGIC 4 byte integer> <1 byte RPC Format Version> <1 byte auth type>
\`\`\`

We need the auth method spec.
here so the connection header is encoded if auth enabled.\\
E.g.: HBas0x000x50 — 4 bytes of MAGIC — \\\`HBas' — plus one-byte of version, 0 in this case, and one byte, 0x50 (SIMPLE). of an auth type.

\`<Protobuf ConnectionHeader Message>\`\\
Has user info, and "protocol", as well as the encoders and compression the client will use sending CellBlocks.
CellBlock encoders and compressors are for the life of the connection.
CellBlock encoders implement org.apache.hadoop.hbase.codec.Codec.
CellBlocks may then also be compressed.
Compressors implement org.apache.hadoop.io.compress.CompressionCodec.
This protobuf is written using writeDelimited so is prefaced by a pb varint with its serialized length

#### Server

After client sends preamble and connection header, server does NOT respond if successful connection setup.
No response means server is READY to accept requests and to give out response.
If the version or authentication in the preamble is not agreeable or the server has trouble parsing the preamble, it will throw a org.apache.hadoop.hbase.ipc.FatalConnectionException explaining the error and will then disconnect.
If the client in the connection header — i.e.
the protobuf'd Message that comes after the connection preamble — asks for a Service the server does not support or a codec the server does not have, again we throw a FatalConnectionException with explanation.

### Request

After a Connection has been set up, client makes requests.
Server responds.

A request is made up of a protobuf RequestHeader followed by a protobuf Message parameter.
The header includes the method name and optionally, metadata on the optional CellBlock that may be following.
The parameter type suits the method being invoked: i.e.
if we are doing a getRegionInfo request, the protobuf Message param will be an instance of GetRegionInfoRequest.
The response will be a GetRegionInfoResponse.
The CellBlock is optionally used ferrying the bulk of the RPC data: i.e. Cells/KeyValues.

#### Request Parts

\`<Total Length>\`\\
The request is prefaced by an int that holds the total length of what follows.

\`<Protobuf RequestHeader Message>\`\\
Will have call.id, trace.id, and method name, etc.
including optional Metadata on the Cell block IFF one is following.
Data is protobuf'd inline in this pb Message or optionally comes in the following CellBlock

\`<Protobuf Param Message>\`\\
If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the request sends a GetRegionInfoRequest protobuf Message param in this position.

\`<CellBlock>\`\\
An encoded and optionally compressed Cell block.

### Response

Same as Request, it is a protobuf ResponseHeader followed by a protobuf Message response where the Message response type suits the method invoked.
Bulk of the data may come in a following CellBlock.

#### Response Parts

\`<Total Length>\`\\
The response is prefaced by an int that holds the total length of what follows.

\`<Protobuf ResponseHeader Message>\`\\
Will have call.id, etc.
Will include exception if failed processing.
Optionally includes metadata on optional, IFF there is a CellBlock following.

\`<Protobuf Response Message>\`\\
Return or may be nothing if exception.
If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the response sends a GetRegionInfoResponse protobuf Message param in this position.

\`<CellBlock>\`\\
An encoded and optionally compressed Cell block.

### Exceptions

There are two distinct types.
There is the request failed which is encapsulated inside the response header for the response.
The connection stays open to receive new requests.
The second type, the FatalConnectionException, kills the connection.

Exceptions can carry extra information.
See the ExceptionResponse protobuf type.
It has a flag to indicate do-no-retry as well as other miscellaneous payload to help improve client responsiveness.

### CellBlocks

These are not versioned.
Server can do the codec or it cannot.
If new version of a codec with say, tighter encoding, then give it a new class name.
Codecs will live on the server for all time so old clients can connect.

## Notes

### Constraints

In some part, current wire-format — i.e.
all requests and responses preceded by a length — has been dictated by current server non-async architecture.

### One fat pb request or header+param

We went with pb header followed by pb param making a request and a pb header followed by pb response for now.
Doing header+param rather than a single protobuf Message with both header and param content:

1. Is closer to what we currently have
2. Having a single fat pb requires extra copying putting the already pb'd param into the body of the fat request pb (and same making result)
3. We can decide whether to accept the request or not before we read the param; for example, the request might be low priority.
   As is, we read header+param in one go as server is currently implemented so this is a TODO.

The advantages are minor.
If later, fat request has clear advantage, can roll out a v2 later.

### RPC Configurations

#### CellBlock Codecs

To enable a codec other than the default \`KeyValueCodec\`, set \`hbase.client.rpc.codec\` to the name of the Codec class to use.
Codec must implement hbase's \`Codec\` Interface.
After connection setup, all passed cellblocks will be sent with this codec.
The server will return cellblocks using this same codec as long as the codec is on the servers' CLASSPATH (else you will get \`UnsupportedCellCodecException\`).

To change the default codec, set \`hbase.client.default.rpc.codec\`.

To disable cellblocks completely and to go pure protobuf, set the default to the empty String and do not specify a codec in your Configuration.
So, set \`hbase.client.default.rpc.codec\` to the empty string and do not set \`hbase.client.rpc.codec\`.
This will cause the client to connect to the server with no codec specified.
If a server sees no codec, it will return all responses in pure protobuf.
Running pure protobuf all the time will be slower than running with cellblocks.

#### Compression

Uses hadoop's compression codecs.
To enable compressing of passed CellBlocks, set \`hbase.client.rpc.compressor\` to the name of the Compressor to use.
Compressor must implement Hadoop's CompressionCodec Interface.
After connection setup, all passed cellblocks will be sent compressed.
The server will return cellblocks compressed using this same compressor as long as the compressor is on its CLASSPATH (else you will get \`UnsupportedCompressionCodecException\`).
`,a={title:"0.95 RPC Specification",description:"HBase RPC wire format and client/server protocol specification for version 0.95+."},i=[{href:"https://developers.google.com/protocol-buffers/"},{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/io/Writable.html"},{href:"https://github.com/OpenTSDB/asynchbase/blob/master/src/HBaseRpc.java#L164"},{href:"https://docs.google.com/document/d/1WCKwgaLDqBw2vpux0jPsAu2WPTRISob7HGCO8YhfDTA/edit#"},{href:"https://docs.google.com/document/d/1WEtrq-JTIUhlnlnvA0oYRLp0F8MKpEBeBSCFcQiacdw/edit#"},{href:"https://github.com/apache/hbase/blob/master/hbase-protocol-shaded/src/main/protobuf/rpc/RPC.proto"}],l={contents:[{heading:void 0,content:`In 0.95, all client/server communication is done with protobuf'ed Messages rather than with Hadoop Writables.
Our RPC wire format therefore changes.
This document describes the client/server request/response protocol and our new RPC wire-format.`},{heading:void 0,content:`For what RPC is like in 0.94 and previous, see Benoît/Tsuna's Unofficial Hadoop / HBase RPC protocol documentation.
For more background on how we arrived at this spec., see HBase RPC: WIP`},{heading:"goals",content:"A wire-format we can evolve"},{heading:"goals",content:"A format that does not require our rewriting server core or radically changing its current architecture (for later)."},{heading:"todo",content:`List of problems with currently specified format and where we would like to go in a version2, etc.
For example, what would we have to change if anything to move server async or to support streaming/chunking?`},{heading:"todo",content:"Diagram on how it works"},{heading:"todo",content:`A grammar that succinctly describes the wire-format.
Currently we have these words and the content of the rpc protobuf idl but a grammar for the back and forth would help with groking rpc.
Also, a little state machine on client/server interactions would help with understanding (and ensuring correct implementation).`},{heading:"rpc-overview",content:`The client will send setup information on connection establish.
Thereafter, the client invokes methods against the remote server sending a protobuf Message and receiving a protobuf Message in response.
Communication is synchronous.
All back and forth is preceded by an int that has the total length of the request/response.
Optionally, Cells(KeyValues) can be passed outside of protobufs in follow-behind Cell blocks
(because we can't protobuf megabytes of KeyValues or Cells). These CellBlocks are encoded and optionally compressed.`},{heading:"rpc-overview",content:`For more detail on the protobufs involved, see the
RPC.proto file in master.`},{heading:"connection-setup",content:"Client initiates connection."},{heading:"rpc-connection-setup-client",content:"On connection setup, client sends a preamble followed by a connection header."},{heading:"rpc-connection-setup-client",content:"<preamble>"},{heading:"rpc-connection-setup-client",content:"We need the auth method spec.\nhere so the connection header is encoded if auth enabled.E.g.: HBas0x000x50 — 4 bytes of MAGIC — `HBas' — plus one-byte of version, 0 in this case, and one byte, 0x50 (SIMPLE). of an auth type."},{heading:"rpc-connection-setup-client",content:`<Protobuf ConnectionHeader Message>Has user info, and "protocol", as well as the encoders and compression the client will use sending CellBlocks.
CellBlock encoders and compressors are for the life of the connection.
CellBlock encoders implement org.apache.hadoop.hbase.codec.Codec.
CellBlocks may then also be compressed.
Compressors implement org.apache.hadoop.io.compress.CompressionCodec.
This protobuf is written using writeDelimited so is prefaced by a pb varint with its serialized length`},{heading:"server",content:`After client sends preamble and connection header, server does NOT respond if successful connection setup.
No response means server is READY to accept requests and to give out response.
If the version or authentication in the preamble is not agreeable or the server has trouble parsing the preamble, it will throw a org.apache.hadoop.hbase.ipc.FatalConnectionException explaining the error and will then disconnect.
If the client in the connection header — i.e.
the protobuf'd Message that comes after the connection preamble — asks for a Service the server does not support or a codec the server does not have, again we throw a FatalConnectionException with explanation.`},{heading:"request",content:`After a Connection has been set up, client makes requests.
Server responds.`},{heading:"request",content:`A request is made up of a protobuf RequestHeader followed by a protobuf Message parameter.
The header includes the method name and optionally, metadata on the optional CellBlock that may be following.
The parameter type suits the method being invoked: i.e.
if we are doing a getRegionInfo request, the protobuf Message param will be an instance of GetRegionInfoRequest.
The response will be a GetRegionInfoResponse.
The CellBlock is optionally used ferrying the bulk of the RPC data: i.e. Cells/KeyValues.`},{heading:"request-parts",content:"<Total Length>The request is prefaced by an int that holds the total length of what follows."},{heading:"request-parts",content:`<Protobuf RequestHeader Message>Will have call.id, trace.id, and method name, etc.
including optional Metadata on the Cell block IFF one is following.
Data is protobuf'd inline in this pb Message or optionally comes in the following CellBlock`},{heading:"request-parts",content:"<Protobuf Param Message>If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the request sends a GetRegionInfoRequest protobuf Message param in this position."},{heading:"request-parts",content:"<CellBlock>An encoded and optionally compressed Cell block."},{heading:"response",content:`Same as Request, it is a protobuf ResponseHeader followed by a protobuf Message response where the Message response type suits the method invoked.
Bulk of the data may come in a following CellBlock.`},{heading:"response-parts",content:"<Total Length>The response is prefaced by an int that holds the total length of what follows."},{heading:"response-parts",content:`<Protobuf ResponseHeader Message>Will have call.id, etc.
Will include exception if failed processing.
Optionally includes metadata on optional, IFF there is a CellBlock following.`},{heading:"response-parts",content:`<Protobuf Response Message>Return or may be nothing if exception.
If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the response sends a GetRegionInfoResponse protobuf Message param in this position.`},{heading:"response-parts",content:"<CellBlock>An encoded and optionally compressed Cell block."},{heading:"exceptions",content:`There are two distinct types.
There is the request failed which is encapsulated inside the response header for the response.
The connection stays open to receive new requests.
The second type, the FatalConnectionException, kills the connection.`},{heading:"exceptions",content:`Exceptions can carry extra information.
See the ExceptionResponse protobuf type.
It has a flag to indicate do-no-retry as well as other miscellaneous payload to help improve client responsiveness.`},{heading:"cellblocks",content:`These are not versioned.
Server can do the codec or it cannot.
If new version of a codec with say, tighter encoding, then give it a new class name.
Codecs will live on the server for all time so old clients can connect.`},{heading:"rpc-constraints",content:`In some part, current wire-format — i.e.
all requests and responses preceded by a length — has been dictated by current server non-async architecture.`},{heading:"one-fat-pb-request-or-headerparam",content:`We went with pb header followed by pb param making a request and a pb header followed by pb response for now.
Doing header+param rather than a single protobuf Message with both header and param content:`},{heading:"one-fat-pb-request-or-headerparam",content:"Is closer to what we currently have"},{heading:"one-fat-pb-request-or-headerparam",content:"Having a single fat pb requires extra copying putting the already pb'd param into the body of the fat request pb (and same making result)"},{heading:"one-fat-pb-request-or-headerparam",content:`We can decide whether to accept the request or not before we read the param; for example, the request might be low priority.
As is, we read header+param in one go as server is currently implemented so this is a TODO.`},{heading:"one-fat-pb-request-or-headerparam",content:`The advantages are minor.
If later, fat request has clear advantage, can roll out a v2 later.`},{heading:"cellblock-codecs",content:`To enable a codec other than the default KeyValueCodec, set hbase.client.rpc.codec to the name of the Codec class to use.
Codec must implement hbase's Codec Interface.
After connection setup, all passed cellblocks will be sent with this codec.
The server will return cellblocks using this same codec as long as the codec is on the servers' CLASSPATH (else you will get UnsupportedCellCodecException).`},{heading:"cellblock-codecs",content:"To change the default codec, set hbase.client.default.rpc.codec."},{heading:"cellblock-codecs",content:`To disable cellblocks completely and to go pure protobuf, set the default to the empty String and do not specify a codec in your Configuration.
So, set hbase.client.default.rpc.codec to the empty string and do not set hbase.client.rpc.codec.
This will cause the client to connect to the server with no codec specified.
If a server sees no codec, it will return all responses in pure protobuf.
Running pure protobuf all the time will be slower than running with cellblocks.`},{heading:"rpc-notes-rpc-configurations-compression",content:`Uses hadoop's compression codecs.
To enable compressing of passed CellBlocks, set hbase.client.rpc.compressor to the name of the Compressor to use.
Compressor must implement Hadoop's CompressionCodec Interface.
After connection setup, all passed cellblocks will be sent compressed.
The server will return cellblocks compressed using this same compressor as long as the compressor is on its CLASSPATH (else you will get UnsupportedCompressionCodecException).`}],headings:[{id:"goals",content:"Goals"},{id:"todo",content:"TODO"},{id:"rpc-overview",content:"RPC"},{id:"connection-setup",content:"Connection Setup"},{id:"rpc-connection-setup-client",content:"Client"},{id:"server",content:"Server"},{id:"request",content:"Request"},{id:"request-parts",content:"Request Parts"},{id:"response",content:"Response"},{id:"response-parts",content:"Response Parts"},{id:"exceptions",content:"Exceptions"},{id:"cellblocks",content:"CellBlocks"},{id:"rpc-notes",content:"Notes"},{id:"rpc-constraints",content:"Constraints"},{id:"one-fat-pb-request-or-headerparam",content:"One fat pb request or header+param"},{id:"rpc-configurations",content:"RPC Configurations"},{id:"cellblock-codecs",content:"CellBlock Codecs"},{id:"rpc-notes-rpc-configurations-compression",content:"Compression"}]};const c=[{depth:2,url:"#goals",title:e.jsx(e.Fragment,{children:"Goals"})},{depth:2,url:"#todo",title:e.jsx(e.Fragment,{children:"TODO"})},{depth:2,url:"#rpc-overview",title:e.jsx(e.Fragment,{children:"RPC"})},{depth:3,url:"#connection-setup",title:e.jsx(e.Fragment,{children:"Connection Setup"})},{depth:4,url:"#rpc-connection-setup-client",title:e.jsx(e.Fragment,{children:"Client"})},{depth:4,url:"#server",title:e.jsx(e.Fragment,{children:"Server"})},{depth:3,url:"#request",title:e.jsx(e.Fragment,{children:"Request"})},{depth:4,url:"#request-parts",title:e.jsx(e.Fragment,{children:"Request Parts"})},{depth:3,url:"#response",title:e.jsx(e.Fragment,{children:"Response"})},{depth:4,url:"#response-parts",title:e.jsx(e.Fragment,{children:"Response Parts"})},{depth:3,url:"#exceptions",title:e.jsx(e.Fragment,{children:"Exceptions"})},{depth:3,url:"#cellblocks",title:e.jsx(e.Fragment,{children:"CellBlocks"})},{depth:2,url:"#rpc-notes",title:e.jsx(e.Fragment,{children:"Notes"})},{depth:3,url:"#rpc-constraints",title:e.jsx(e.Fragment,{children:"Constraints"})},{depth:3,url:"#one-fat-pb-request-or-headerparam",title:e.jsx(e.Fragment,{children:"One fat pb request or header+param"})},{depth:3,url:"#rpc-configurations",title:e.jsx(e.Fragment,{children:"RPC Configurations"})},{depth:4,url:"#cellblock-codecs",title:e.jsx(e.Fragment,{children:"CellBlock Codecs"})},{depth:4,url:"#rpc-notes-rpc-configurations-compression",title:e.jsx(e.Fragment,{children:"Compression"})}];function t(o){const n={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",...o.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["In 0.95, all client/server communication is done with ",e.jsx(n.a,{href:"https://developers.google.com/protocol-buffers/",children:"protobuf'ed"})," Messages rather than with ",e.jsx(n.a,{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/io/Writable.html",children:"Hadoop Writables"}),`.
Our RPC wire format therefore changes.
This document describes the client/server request/response protocol and our new RPC wire-format.`]}),`
`,e.jsxs(n.p,{children:["For what RPC is like in 0.94 and previous, see Benoît/Tsuna's ",e.jsx(n.a,{href:"https://github.com/OpenTSDB/asynchbase/blob/master/src/HBaseRpc.java#L164",children:"Unofficial Hadoop / HBase RPC protocol documentation"}),`.
For more background on how we arrived at this spec., see `,e.jsx(n.a,{href:"https://docs.google.com/document/d/1WCKwgaLDqBw2vpux0jPsAu2WPTRISob7HGCO8YhfDTA/edit#",children:"HBase RPC: WIP"})]}),`
`,e.jsx(n.h2,{id:"goals",children:"Goals"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"A wire-format we can evolve"}),`
`,e.jsx(n.li,{children:"A format that does not require our rewriting server core or radically changing its current architecture (for later)."}),`
`]}),`
`,e.jsx(n.h2,{id:"todo",children:"TODO"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:`List of problems with currently specified format and where we would like to go in a version2, etc.
For example, what would we have to change if anything to move server async or to support streaming/chunking?`}),`
`,e.jsx(n.li,{children:"Diagram on how it works"}),`
`,e.jsx(n.li,{children:`A grammar that succinctly describes the wire-format.
Currently we have these words and the content of the rpc protobuf idl but a grammar for the back and forth would help with groking rpc.
Also, a little state machine on client/server interactions would help with understanding (and ensuring correct implementation).`}),`
`]}),`
`,e.jsx(n.h2,{id:"rpc-overview",children:"RPC"}),`
`,e.jsxs(n.p,{children:[`The client will send setup information on connection establish.
Thereafter, the client invokes methods against the remote server sending a protobuf Message and receiving a protobuf Message in response.
Communication is synchronous.
All back and forth is preceded by an int that has the total length of the request/response.
Optionally, Cells(KeyValues) can be passed outside of protobufs in follow-behind Cell blocks
(because `,e.jsx(n.a,{href:"https://docs.google.com/document/d/1WEtrq-JTIUhlnlnvA0oYRLp0F8MKpEBeBSCFcQiacdw/edit#",children:"we can't protobuf megabytes of KeyValues"})," or Cells). These CellBlocks are encoded and optionally compressed."]}),`
`,e.jsxs(n.p,{children:[`For more detail on the protobufs involved, see the
`,e.jsx(n.a,{href:"https://github.com/apache/hbase/blob/master/hbase-protocol-shaded/src/main/protobuf/rpc/RPC.proto",children:"RPC.proto"})," file in master."]}),`
`,e.jsx(n.h3,{id:"connection-setup",children:"Connection Setup"}),`
`,e.jsx(n.p,{children:"Client initiates connection."}),`
`,e.jsx(n.h4,{id:"rpc-connection-setup-client",children:"Client"}),`
`,e.jsx(n.p,{children:"On connection setup, client sends a preamble followed by a connection header."}),`
`,e.jsx(n.p,{children:e.jsx(n.code,{children:"<preamble>"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"<MAGIC 4 byte integer> <1 byte RPC Format Version> <1 byte auth type>"})})})})}),`
`,e.jsxs(n.p,{children:[`We need the auth method spec.
here so the connection header is encoded if auth enabled.`,e.jsx(n.br,{}),`
`,"E.g.: HBas0x000x50 — 4 bytes of MAGIC — `HBas' — plus one-byte of version, 0 in this case, and one byte, 0x50 (SIMPLE). of an auth type."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Protobuf ConnectionHeader Message>"}),e.jsx(n.br,{}),`
`,`Has user info, and "protocol", as well as the encoders and compression the client will use sending CellBlocks.
CellBlock encoders and compressors are for the life of the connection.
CellBlock encoders implement org.apache.hadoop.hbase.codec.Codec.
CellBlocks may then also be compressed.
Compressors implement org.apache.hadoop.io.compress.CompressionCodec.
This protobuf is written using writeDelimited so is prefaced by a pb varint with its serialized length`]}),`
`,e.jsx(n.h4,{id:"server",children:"Server"}),`
`,e.jsx(n.p,{children:`After client sends preamble and connection header, server does NOT respond if successful connection setup.
No response means server is READY to accept requests and to give out response.
If the version or authentication in the preamble is not agreeable or the server has trouble parsing the preamble, it will throw a org.apache.hadoop.hbase.ipc.FatalConnectionException explaining the error and will then disconnect.
If the client in the connection header — i.e.
the protobuf'd Message that comes after the connection preamble — asks for a Service the server does not support or a codec the server does not have, again we throw a FatalConnectionException with explanation.`}),`
`,e.jsx(n.h3,{id:"request",children:"Request"}),`
`,e.jsx(n.p,{children:`After a Connection has been set up, client makes requests.
Server responds.`}),`
`,e.jsx(n.p,{children:`A request is made up of a protobuf RequestHeader followed by a protobuf Message parameter.
The header includes the method name and optionally, metadata on the optional CellBlock that may be following.
The parameter type suits the method being invoked: i.e.
if we are doing a getRegionInfo request, the protobuf Message param will be an instance of GetRegionInfoRequest.
The response will be a GetRegionInfoResponse.
The CellBlock is optionally used ferrying the bulk of the RPC data: i.e. Cells/KeyValues.`}),`
`,e.jsx(n.h4,{id:"request-parts",children:"Request Parts"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Total Length>"}),e.jsx(n.br,{}),`
`,"The request is prefaced by an int that holds the total length of what follows."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Protobuf RequestHeader Message>"}),e.jsx(n.br,{}),`
`,`Will have call.id, trace.id, and method name, etc.
including optional Metadata on the Cell block IFF one is following.
Data is protobuf'd inline in this pb Message or optionally comes in the following CellBlock`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Protobuf Param Message>"}),e.jsx(n.br,{}),`
`,"If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the request sends a GetRegionInfoRequest protobuf Message param in this position."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<CellBlock>"}),e.jsx(n.br,{}),`
`,"An encoded and optionally compressed Cell block."]}),`
`,e.jsx(n.h3,{id:"response",children:"Response"}),`
`,e.jsx(n.p,{children:`Same as Request, it is a protobuf ResponseHeader followed by a protobuf Message response where the Message response type suits the method invoked.
Bulk of the data may come in a following CellBlock.`}),`
`,e.jsx(n.h4,{id:"response-parts",children:"Response Parts"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Total Length>"}),e.jsx(n.br,{}),`
`,"The response is prefaced by an int that holds the total length of what follows."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Protobuf ResponseHeader Message>"}),e.jsx(n.br,{}),`
`,`Will have call.id, etc.
Will include exception if failed processing.
Optionally includes metadata on optional, IFF there is a CellBlock following.`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<Protobuf Response Message>"}),e.jsx(n.br,{}),`
`,`Return or may be nothing if exception.
If the method being invoked is getRegionInfo, if you study the Service descriptor for the client to regionserver protocol, you will find that the response sends a GetRegionInfoResponse protobuf Message param in this position.`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<CellBlock>"}),e.jsx(n.br,{}),`
`,"An encoded and optionally compressed Cell block."]}),`
`,e.jsx(n.h3,{id:"exceptions",children:"Exceptions"}),`
`,e.jsx(n.p,{children:`There are two distinct types.
There is the request failed which is encapsulated inside the response header for the response.
The connection stays open to receive new requests.
The second type, the FatalConnectionException, kills the connection.`}),`
`,e.jsx(n.p,{children:`Exceptions can carry extra information.
See the ExceptionResponse protobuf type.
It has a flag to indicate do-no-retry as well as other miscellaneous payload to help improve client responsiveness.`}),`
`,e.jsx(n.h3,{id:"cellblocks",children:"CellBlocks"}),`
`,e.jsx(n.p,{children:`These are not versioned.
Server can do the codec or it cannot.
If new version of a codec with say, tighter encoding, then give it a new class name.
Codecs will live on the server for all time so old clients can connect.`}),`
`,e.jsx(n.h2,{id:"rpc-notes",children:"Notes"}),`
`,e.jsx(n.h3,{id:"rpc-constraints",children:"Constraints"}),`
`,e.jsx(n.p,{children:`In some part, current wire-format — i.e.
all requests and responses preceded by a length — has been dictated by current server non-async architecture.`}),`
`,e.jsx(n.h3,{id:"one-fat-pb-request-or-headerparam",children:"One fat pb request or header+param"}),`
`,e.jsx(n.p,{children:`We went with pb header followed by pb param making a request and a pb header followed by pb response for now.
Doing header+param rather than a single protobuf Message with both header and param content:`}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Is closer to what we currently have"}),`
`,e.jsx(n.li,{children:"Having a single fat pb requires extra copying putting the already pb'd param into the body of the fat request pb (and same making result)"}),`
`,e.jsx(n.li,{children:`We can decide whether to accept the request or not before we read the param; for example, the request might be low priority.
As is, we read header+param in one go as server is currently implemented so this is a TODO.`}),`
`]}),`
`,e.jsx(n.p,{children:`The advantages are minor.
If later, fat request has clear advantage, can roll out a v2 later.`}),`
`,e.jsx(n.h3,{id:"rpc-configurations",children:"RPC Configurations"}),`
`,e.jsx(n.h4,{id:"cellblock-codecs",children:"CellBlock Codecs"}),`
`,e.jsxs(n.p,{children:["To enable a codec other than the default ",e.jsx(n.code,{children:"KeyValueCodec"}),", set ",e.jsx(n.code,{children:"hbase.client.rpc.codec"}),` to the name of the Codec class to use.
Codec must implement hbase's `,e.jsx(n.code,{children:"Codec"}),` Interface.
After connection setup, all passed cellblocks will be sent with this codec.
The server will return cellblocks using this same codec as long as the codec is on the servers' CLASSPATH (else you will get `,e.jsx(n.code,{children:"UnsupportedCellCodecException"}),")."]}),`
`,e.jsxs(n.p,{children:["To change the default codec, set ",e.jsx(n.code,{children:"hbase.client.default.rpc.codec"}),"."]}),`
`,e.jsxs(n.p,{children:[`To disable cellblocks completely and to go pure protobuf, set the default to the empty String and do not specify a codec in your Configuration.
So, set `,e.jsx(n.code,{children:"hbase.client.default.rpc.codec"})," to the empty string and do not set ",e.jsx(n.code,{children:"hbase.client.rpc.codec"}),`.
This will cause the client to connect to the server with no codec specified.
If a server sees no codec, it will return all responses in pure protobuf.
Running pure protobuf all the time will be slower than running with cellblocks.`]}),`
`,e.jsx(n.h4,{id:"rpc-notes-rpc-configurations-compression",children:"Compression"}),`
`,e.jsxs(n.p,{children:[`Uses hadoop's compression codecs.
To enable compressing of passed CellBlocks, set `,e.jsx(n.code,{children:"hbase.client.rpc.compressor"}),` to the name of the Compressor to use.
Compressor must implement Hadoop's CompressionCodec Interface.
After connection setup, all passed cellblocks will be sent compressed.
The server will return cellblocks compressed using this same compressor as long as the compressor is on its CLASSPATH (else you will get `,e.jsx(n.code,{children:"UnsupportedCompressionCodecException"}),")."]})]})}function h(o={}){const{wrapper:n}=o.components||{};return n?e.jsx(n,{...o,children:e.jsx(t,{...o})}):t(o)}export{r as _markdown,h as default,i as extractedReferences,a as frontmatter,l as structuredData,c as toc};
