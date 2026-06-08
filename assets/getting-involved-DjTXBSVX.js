import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let o=`Apache HBase gets better only when people contribute! If you are looking to contribute to Apache HBase, look for [issues in JIRA tagged with the label 'beginner'](https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20\\(beginner\\)%20AND%20status%20in%20\\(Open%2C%20%22In%20Progress%22%2C%20Reopened\\)).
These are issues HBase contributors have deemed worthy but not of immediate priority and a good way to ramp on HBase internals.
See [What label
is used for issues that are good on ramps for new contributors?](https://lists.apache.org/thread.html/b122265f4e4054cf08f8cd38609fb06af72f398c44f9086b05ef4e21%401407246237%40%3Cdev.hbase.apache.org%3E) from the dev mailing list for background.

Before you get started submitting code to HBase, please refer to [Developer Guidelines](/docs/building-and-developing/developer-guidelines).

As Apache HBase is an Apache Software Foundation project, see [The Apache Software Foundation](/docs/asf) for more information about how the ASF functions.

## Mailing Lists

Sign up for the dev-list and the user-list.
See the [mailing lists](/mailing-lists) page.
Posing questions - and helping to answer other people's questions - is encouraged! There are varying levels of experience on both lists so patience and politeness are encouraged (and please stay on topic.)

## Slack

The Apache HBase project uses the #hbase channel on the official
[ASF Slack Workspace](https://the-asf.slack.com/) for real-time questions and discussion.
All committers of any Apache projects can join the channel directly, for others, please mail
[dev@hbase.apache.org](mailto:dev@hbase.apache.org) to request an invite.

## Internet Relay Chat (IRC)

(NOTE: Our IRC channel seems to have been deprecated in favor of the above Slack channel)

For real-time questions and discussions, use the \`#hbase\` IRC channel on the [FreeNode](https://freenode.net/) IRC network.
FreeNode offers a web-based client, but most people prefer a native client, and several clients are available for each operating system.

## Jira

Check for existing issues in [Jira](https://issues.apache.org/jira/projects/HBASE/issues).
If it's either a new feature request, enhancement, or a bug, file a ticket.

We track multiple types of work in JIRA:

* Bug: Something is broken in HBase itself.
* Test: A test is needed, or a test is broken.
* New feature: You have an idea for new functionality. It's often best to bring
  these up on the mailing lists first, and then write up a design specification
  that you add to the feature request JIRA.
* Improvement: A feature exists, but could be tweaked or augmented. It's often
  best to bring these up on the mailing lists first and have a discussion, then
  summarize or link to the discussion if others seem interested in the
  improvement.
* Wish: This is like a new feature, but for something you may not have the
  background to flesh out yourself.

Bugs and tests have the highest priority and should be actionable.

### Guidelines for reporting effective issues

* *Search for duplicates*: Your issue may have already been reported. Have a
  look, realizing that someone else might have worded the summary differently.

  Also search the mailing lists, which may have information about your problem
  and how to work around it. Don't file an issue for something that has already
  been discussed and resolved on a mailing list, unless you strongly disagree
  with the resolution *and* are willing to help take the issue forward.

  * *Discuss in public*: Use the mailing lists to discuss what you've discovered
    and see if there is something you've missed. Avoid using back channels, so
    that you benefit from the experience and expertise of the project as a whole.
  * *Don't file on behalf of others*: You might not have all the context, and you
    don't have as much motivation to see it through as the person who is actually
    experiencing the bug. It's more helpful in the long term to encourage others
    to file their own issues. Point them to this material and offer to help out
    the first time or two.
  * *Write a good summary*: A good summary includes information about the problem,
    the impact on the user or developer, and the area of the code.
    * Good: \`Address new license dependencies from hadoop3-alpha4\`
    * Room for improvement: \`Canary is broken\`
      If you write a bad title, someone else will rewrite it for you. This is time
      they could have spent working on the issue instead.
  * *Give context in the description*: It can be good to think of this in multiple
    parts:
    * What happens or doesn't happen?
    * How does it impact you?
    * How can someone else reproduce it?
    * What would "fixed" look like?\\
      You don't need to know the answers for all of these, but give as much
      information as you can. If you can provide technical information, such as a
      Git commit SHA that you think might have caused the issue or a build failure
      on builds.apache.org where you think the issue first showed up, share that
      info.
  * **Fill in all relevant fields**: These fields help us filter, categorize, and
    find things.
  * **One bug, one issue, one patch**: To help with back-porting, don't split issues
    or fixes among multiple bugs.
  * **Add value if you can**: Filing issues is great, even if you don't know how to
    fix them. But providing as much information as possible, being willing to
    triage and answer questions, and being willing to test potential fixes is even
    better! We want to fix your issue as quickly as you want it to be fixed.
  * **Don't be upset if we don't fix it**: Time and resources are finite. In some
    cases, we may not be able to (or might choose not to) fix an issue, especially
    if it is an edge case or there is a workaround. Even if it doesn't get fixed,
    the JIRA is a public record of it, and will help others out if they run into
    a similar issue in the future.

### Working on an issue

To check for existing issues which you can tackle as a beginner, search for [issues in JIRA tagged with the label 'beginner'](https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20\\(beginner\\)%20AND%20status%20in%20\\(Open%2C%20%22In%20Progress%22%2C%20Reopened\\)).

JIRA Priorites:

* **Blocker**: Should only be used if the issue WILL cause data loss or cluster instability reliably.
* **Critical**: The issue described can cause data loss or cluster instability in some cases.
* **Major**: Important but not tragic issues, like updates to the client API that will add a lot of much-needed functionality or significant bugs that need to be fixed but that don't cause data loss.
* **Minor**: Useful enhancements and annoying but not damaging bugs.
* **Trivial**: Useful enhancements but generally cosmetic.

Code Blocks in Jira Comments:

A commonly used macro in Jira is \`{code}\`. Everything inside the tags is preformatted, as in this example.

\`\`\`text
{code}
code snippet
{code}
\`\`\`
`,a={title:"Getting Involved",description:"How to contribute to Apache HBase including mailing lists, Slack, IRC, JIRA, and guidelines for reporting effective issues."},r=[{href:"https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20(beginner)%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)"},{href:"https://lists.apache.org/thread.html/b122265f4e4054cf08f8cd38609fb06af72f398c44f9086b05ef4e21%401407246237%40%3Cdev.hbase.apache.org%3E"},{href:"/docs/building-and-developing/developer-guidelines"},{href:"/docs/asf"},{href:"/mailing-lists"},{href:"https://the-asf.slack.com/"},{href:"mailto:dev@hbase.apache.org"},{href:"https://freenode.net/"},{href:"https://issues.apache.org/jira/projects/HBASE/issues"},{href:"https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20(beginner)%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)"}],l={contents:[{heading:void 0,content:`Apache HBase gets better only when people contribute! If you are looking to contribute to Apache HBase, look for issues in JIRA tagged with the label 'beginner'.
These are issues HBase contributors have deemed worthy but not of immediate priority and a good way to ramp on HBase internals.
See What label
is used for issues that are good on ramps for new contributors? from the dev mailing list for background.`},{heading:void 0,content:"Before you get started submitting code to HBase, please refer to Developer Guidelines."},{heading:void 0,content:"As Apache HBase is an Apache Software Foundation project, see The Apache Software Foundation for more information about how the ASF functions."},{heading:"building-and-developing-getting-involved-mailing-lists",content:`Sign up for the dev-list and the user-list.
See the mailing lists page.
Posing questions - and helping to answer other people's questions - is encouraged! There are varying levels of experience on both lists so patience and politeness are encouraged (and please stay on topic.)`},{heading:"building-and-developing-getting-involved-slack",content:`The Apache HBase project uses the #hbase channel on the official
ASF Slack Workspace for real-time questions and discussion.
All committers of any Apache projects can join the channel directly, for others, please mail
dev@hbase.apache.org to request an invite.`},{heading:"internet-relay-chat-irc",content:"(NOTE: Our IRC channel seems to have been deprecated in favor of the above Slack channel)"},{heading:"internet-relay-chat-irc",content:`For real-time questions and discussions, use the #hbase IRC channel on the FreeNode IRC network.
FreeNode offers a web-based client, but most people prefer a native client, and several clients are available for each operating system.`},{heading:"building-and-developing-getting-involved-jira",content:`Check for existing issues in Jira.
If it's either a new feature request, enhancement, or a bug, file a ticket.`},{heading:"building-and-developing-getting-involved-jira",content:"We track multiple types of work in JIRA:"},{heading:"building-and-developing-getting-involved-jira",content:"Bug: Something is broken in HBase itself."},{heading:"building-and-developing-getting-involved-jira",content:"Test: A test is needed, or a test is broken."},{heading:"building-and-developing-getting-involved-jira",content:`New feature: You have an idea for new functionality. It's often best to bring
these up on the mailing lists first, and then write up a design specification
that you add to the feature request JIRA.`},{heading:"building-and-developing-getting-involved-jira",content:`Improvement: A feature exists, but could be tweaked or augmented. It's often
best to bring these up on the mailing lists first and have a discussion, then
summarize or link to the discussion if others seem interested in the
improvement.`},{heading:"building-and-developing-getting-involved-jira",content:`Wish: This is like a new feature, but for something you may not have the
background to flesh out yourself.`},{heading:"building-and-developing-getting-involved-jira",content:"Bugs and tests have the highest priority and should be actionable."},{heading:"guidelines-for-reporting-effective-issues",content:`Search for duplicates: Your issue may have already been reported. Have a
look, realizing that someone else might have worded the summary differently.`},{heading:"guidelines-for-reporting-effective-issues",content:`Also search the mailing lists, which may have information about your problem
and how to work around it. Don't file an issue for something that has already
been discussed and resolved on a mailing list, unless you strongly disagree
with the resolution and are willing to help take the issue forward.`},{heading:"guidelines-for-reporting-effective-issues",content:`Discuss in public: Use the mailing lists to discuss what you've discovered
and see if there is something you've missed. Avoid using back channels, so
that you benefit from the experience and expertise of the project as a whole.`},{heading:"guidelines-for-reporting-effective-issues",content:`Don't file on behalf of others: You might not have all the context, and you
don't have as much motivation to see it through as the person who is actually
experiencing the bug. It's more helpful in the long term to encourage others
to file their own issues. Point them to this material and offer to help out
the first time or two.`},{heading:"guidelines-for-reporting-effective-issues",content:`Write a good summary: A good summary includes information about the problem,
the impact on the user or developer, and the area of the code.`},{heading:"guidelines-for-reporting-effective-issues",content:"Good: Address new license dependencies from hadoop3-alpha4"},{heading:"guidelines-for-reporting-effective-issues",content:`Room for improvement: Canary is broken
If you write a bad title, someone else will rewrite it for you. This is time
they could have spent working on the issue instead.`},{heading:"guidelines-for-reporting-effective-issues",content:`Give context in the description: It can be good to think of this in multiple
parts:`},{heading:"guidelines-for-reporting-effective-issues",content:"What happens or doesn't happen?"},{heading:"guidelines-for-reporting-effective-issues",content:"How does it impact you?"},{heading:"guidelines-for-reporting-effective-issues",content:"How can someone else reproduce it?"},{heading:"guidelines-for-reporting-effective-issues",content:`What would "fixed" look like?You don't need to know the answers for all of these, but give as much
information as you can. If you can provide technical information, such as a
Git commit SHA that you think might have caused the issue or a build failure
on builds.apache.org where you think the issue first showed up, share that
info.`},{heading:"guidelines-for-reporting-effective-issues",content:`Fill in all relevant fields: These fields help us filter, categorize, and
find things.`},{heading:"guidelines-for-reporting-effective-issues",content:`One bug, one issue, one patch: To help with back-porting, don't split issues
or fixes among multiple bugs.`},{heading:"guidelines-for-reporting-effective-issues",content:`Add value if you can: Filing issues is great, even if you don't know how to
fix them. But providing as much information as possible, being willing to
triage and answer questions, and being willing to test potential fixes is even
better! We want to fix your issue as quickly as you want it to be fixed.`},{heading:"guidelines-for-reporting-effective-issues",content:`Don't be upset if we don't fix it: Time and resources are finite. In some
cases, we may not be able to (or might choose not to) fix an issue, especially
if it is an edge case or there is a workaround. Even if it doesn't get fixed,
the JIRA is a public record of it, and will help others out if they run into
a similar issue in the future.`},{heading:"working-on-an-issue",content:"To check for existing issues which you can tackle as a beginner, search for issues in JIRA tagged with the label 'beginner'."},{heading:"working-on-an-issue",content:"JIRA Priorites:"},{heading:"working-on-an-issue",content:"Blocker: Should only be used if the issue WILL cause data loss or cluster instability reliably."},{heading:"working-on-an-issue",content:"Critical: The issue described can cause data loss or cluster instability in some cases."},{heading:"working-on-an-issue",content:"Major: Important but not tragic issues, like updates to the client API that will add a lot of much-needed functionality or significant bugs that need to be fixed but that don't cause data loss."},{heading:"working-on-an-issue",content:"Minor: Useful enhancements and annoying but not damaging bugs."},{heading:"working-on-an-issue",content:"Trivial: Useful enhancements but generally cosmetic."},{heading:"working-on-an-issue",content:"Code Blocks in Jira Comments:"},{heading:"working-on-an-issue",content:"A commonly used macro in Jira is {code}. Everything inside the tags is preformatted, as in this example."}],headings:[{id:"building-and-developing-getting-involved-mailing-lists",content:"Mailing Lists"},{id:"building-and-developing-getting-involved-slack",content:"Slack"},{id:"internet-relay-chat-irc",content:"Internet Relay Chat (IRC)"},{id:"building-and-developing-getting-involved-jira",content:"Jira"},{id:"guidelines-for-reporting-effective-issues",content:"Guidelines for reporting effective issues"},{id:"working-on-an-issue",content:"Working on an issue"}]};const h=[{depth:2,url:"#building-and-developing-getting-involved-mailing-lists",title:e.jsx(e.Fragment,{children:"Mailing Lists"})},{depth:2,url:"#building-and-developing-getting-involved-slack",title:e.jsx(e.Fragment,{children:"Slack"})},{depth:2,url:"#internet-relay-chat-irc",title:e.jsx(e.Fragment,{children:"Internet Relay Chat (IRC)"})},{depth:2,url:"#building-and-developing-getting-involved-jira",title:e.jsx(e.Fragment,{children:"Jira"})},{depth:3,url:"#guidelines-for-reporting-effective-issues",title:e.jsx(e.Fragment,{children:"Guidelines for reporting effective issues"})},{depth:3,url:"#working-on-an-issue",title:e.jsx(e.Fragment,{children:"Working on an issue"})}];function t(i){const n={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Apache HBase gets better only when people contribute! If you are looking to contribute to Apache HBase, look for ",e.jsx(n.a,{href:"https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20(beginner)%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)",children:"issues in JIRA tagged with the label 'beginner'"}),`.
These are issues HBase contributors have deemed worthy but not of immediate priority and a good way to ramp on HBase internals.
See `,e.jsx(n.a,{href:"https://lists.apache.org/thread.html/b122265f4e4054cf08f8cd38609fb06af72f398c44f9086b05ef4e21%401407246237%40%3Cdev.hbase.apache.org%3E",children:`What label
is used for issues that are good on ramps for new contributors?`})," from the dev mailing list for background."]}),`
`,e.jsxs(n.p,{children:["Before you get started submitting code to HBase, please refer to ",e.jsx(n.a,{href:"/docs/building-and-developing/developer-guidelines",children:"Developer Guidelines"}),"."]}),`
`,e.jsxs(n.p,{children:["As Apache HBase is an Apache Software Foundation project, see ",e.jsx(n.a,{href:"/docs/asf",children:"The Apache Software Foundation"})," for more information about how the ASF functions."]}),`
`,e.jsx(n.h2,{id:"building-and-developing-getting-involved-mailing-lists",children:"Mailing Lists"}),`
`,e.jsxs(n.p,{children:[`Sign up for the dev-list and the user-list.
See the `,e.jsx(n.a,{href:"/mailing-lists",children:"mailing lists"}),` page.
Posing questions - and helping to answer other people's questions - is encouraged! There are varying levels of experience on both lists so patience and politeness are encouraged (and please stay on topic.)`]}),`
`,e.jsx(n.h2,{id:"building-and-developing-getting-involved-slack",children:"Slack"}),`
`,e.jsxs(n.p,{children:[`The Apache HBase project uses the #hbase channel on the official
`,e.jsx(n.a,{href:"https://the-asf.slack.com/",children:"ASF Slack Workspace"}),` for real-time questions and discussion.
All committers of any Apache projects can join the channel directly, for others, please mail
`,e.jsx(n.a,{href:"mailto:dev@hbase.apache.org",children:"dev@hbase.apache.org"})," to request an invite."]}),`
`,e.jsx(n.h2,{id:"internet-relay-chat-irc",children:"Internet Relay Chat (IRC)"}),`
`,e.jsx(n.p,{children:"(NOTE: Our IRC channel seems to have been deprecated in favor of the above Slack channel)"}),`
`,e.jsxs(n.p,{children:["For real-time questions and discussions, use the ",e.jsx(n.code,{children:"#hbase"})," IRC channel on the ",e.jsx(n.a,{href:"https://freenode.net/",children:"FreeNode"}),` IRC network.
FreeNode offers a web-based client, but most people prefer a native client, and several clients are available for each operating system.`]}),`
`,e.jsx(n.h2,{id:"building-and-developing-getting-involved-jira",children:"Jira"}),`
`,e.jsxs(n.p,{children:["Check for existing issues in ",e.jsx(n.a,{href:"https://issues.apache.org/jira/projects/HBASE/issues",children:"Jira"}),`.
If it's either a new feature request, enhancement, or a bug, file a ticket.`]}),`
`,e.jsx(n.p,{children:"We track multiple types of work in JIRA:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Bug: Something is broken in HBase itself."}),`
`,e.jsx(n.li,{children:"Test: A test is needed, or a test is broken."}),`
`,e.jsx(n.li,{children:`New feature: You have an idea for new functionality. It's often best to bring
these up on the mailing lists first, and then write up a design specification
that you add to the feature request JIRA.`}),`
`,e.jsx(n.li,{children:`Improvement: A feature exists, but could be tweaked or augmented. It's often
best to bring these up on the mailing lists first and have a discussion, then
summarize or link to the discussion if others seem interested in the
improvement.`}),`
`,e.jsx(n.li,{children:`Wish: This is like a new feature, but for something you may not have the
background to flesh out yourself.`}),`
`]}),`
`,e.jsx(n.p,{children:"Bugs and tests have the highest priority and should be actionable."}),`
`,e.jsx(n.h3,{id:"guidelines-for-reporting-effective-issues",children:"Guidelines for reporting effective issues"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.em,{children:"Search for duplicates"}),`: Your issue may have already been reported. Have a
look, realizing that someone else might have worded the summary differently.`]}),`
`,e.jsxs(n.p,{children:[`Also search the mailing lists, which may have information about your problem
and how to work around it. Don't file an issue for something that has already
been discussed and resolved on a mailing list, unless you strongly disagree
with the resolution `,e.jsx(n.em,{children:"and"})," are willing to help take the issue forward."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Discuss in public"}),`: Use the mailing lists to discuss what you've discovered
and see if there is something you've missed. Avoid using back channels, so
that you benefit from the experience and expertise of the project as a whole.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Don't file on behalf of others"}),`: You might not have all the context, and you
don't have as much motivation to see it through as the person who is actually
experiencing the bug. It's more helpful in the long term to encourage others
to file their own issues. Point them to this material and offer to help out
the first time or two.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Write a good summary"}),`: A good summary includes information about the problem,
the impact on the user or developer, and the area of the code.`,`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Good: ",e.jsx(n.code,{children:"Address new license dependencies from hadoop3-alpha4"})]}),`
`,e.jsxs(n.li,{children:["Room for improvement: ",e.jsx(n.code,{children:"Canary is broken"}),`
If you write a bad title, someone else will rewrite it for you. This is time
they could have spent working on the issue instead.`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Give context in the description"}),`: It can be good to think of this in multiple
parts:`,`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"What happens or doesn't happen?"}),`
`,e.jsx(n.li,{children:"How does it impact you?"}),`
`,e.jsx(n.li,{children:"How can someone else reproduce it?"}),`
`,e.jsxs(n.li,{children:['What would "fixed" look like?',e.jsx(n.br,{}),`
`,`You don't need to know the answers for all of these, but give as much
information as you can. If you can provide technical information, such as a
Git commit SHA that you think might have caused the issue or a build failure
on builds.apache.org where you think the issue first showed up, share that
info.`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Fill in all relevant fields"}),`: These fields help us filter, categorize, and
find things.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"One bug, one issue, one patch"}),`: To help with back-porting, don't split issues
or fixes among multiple bugs.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Add value if you can"}),`: Filing issues is great, even if you don't know how to
fix them. But providing as much information as possible, being willing to
triage and answer questions, and being willing to test potential fixes is even
better! We want to fix your issue as quickly as you want it to be fixed.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Don't be upset if we don't fix it"}),`: Time and resources are finite. In some
cases, we may not be able to (or might choose not to) fix an issue, especially
if it is an edge case or there is a workaround. Even if it doesn't get fixed,
the JIRA is a public record of it, and will help others out if they run into
a similar issue in the future.`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"working-on-an-issue",children:"Working on an issue"}),`
`,e.jsxs(n.p,{children:["To check for existing issues which you can tackle as a beginner, search for ",e.jsx(n.a,{href:"https://issues.apache.org/jira/issues/?jql=project%20%3D%20HBASE%20AND%20labels%20in%20(beginner)%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)",children:"issues in JIRA tagged with the label 'beginner'"}),"."]}),`
`,e.jsx(n.p,{children:"JIRA Priorites:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Blocker"}),": Should only be used if the issue WILL cause data loss or cluster instability reliably."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Critical"}),": The issue described can cause data loss or cluster instability in some cases."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Major"}),": Important but not tragic issues, like updates to the client API that will add a lot of much-needed functionality or significant bugs that need to be fixed but that don't cause data loss."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Minor"}),": Useful enhancements and annoying but not damaging bugs."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Trivial"}),": Useful enhancements but generally cosmetic."]}),`
`]}),`
`,e.jsx(n.p,{children:"Code Blocks in Jira Comments:"}),`
`,e.jsxs(n.p,{children:["A commonly used macro in Jira is ",e.jsx(n.code,{children:"{code}"}),". Everything inside the tags is preformatted, as in this example."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"{code}"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"code snippet"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"{code}"})})]})})})]})}function d(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{o as _markdown,d as default,r as extractedReferences,a as frontmatter,l as structuredData,h as toc};
