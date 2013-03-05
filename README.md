lionSync
========

HTML5 offline p2p syncing

Today, in many parts of the world, a pervasive internet connection is not widely available.  We call this issue the "intermittent internet." A government official collecting sanitation data in Malawi may log it to an excel spreadsheet. Periodically, he may deliver that data to the government, or others may simply ask him when information is needed. This latter process could take time. Regardless, for most of its existence, this rich store of data is unavailable to stakeholders who could use it to understand the situation and implement a needs-based fix.  

It was this initial problem statement that the lionSync team sought to find a solution for.  We quickly realized that what we were building would be useful not just for this specific use-case, but for a whole bunch of other problems in the developing world and elsewhere.  We call our project a "meta-solution" for this reason.  

Presently, there are a client and a server that can sync tables in a websql database. The server runs on node.js' express web server, while the client can run in any modern browser supporting webSQL.  An abitrary number of clients is supported, but one server is needed.  Client-side, currently this means we support any webkit browser (such as Chrome and Safari) as well as Opera on the desktop, and most all mobile browsers including Android's Chrome browser and iOS' mobileSafari.  An unfortunate (and possibly temporary) omission is Mozilla's Firefox, as Mozilla has stated that they will not implement webSQL.

We are working towards a more peer-to-peer model where all nodes are client/servers.  To this end, we are aiming to package our current node.js server as a standalone app á-la TileMill.  node.js is an interesting package to work with, focusing on asynchronous calls written in javascript.  For those coming from the LAMP end of things, it's sort of like working with a perl script crossed with Apache's httpd.conf (which you can do with mod_perl, by the way).  We are looking at WebSocket bi-directional communications support for both the node.js app and the in-browser app.  The client-side static page will still have its uses in the future, however.  We see it being useful for quickly deploying to additional peers, especially smartphones that cannot run node.js.  We are aware of some attempts to bring node to iOS and attempts to "webify" node apps so that they can run in-browser. 

This brings us to our concept of "stickiness."  With a p2p app, data and the tools to manipulate it can be shared easily over an intermittent network, or usb drives. Just run the app in place, or download it. A person unable to run the p2p app can run the in-browser client easily by using zeroconf discovery or by scanning the QR code on another peer's in-browser page with a smartphone.  Everyone has a copy of the data, and can add to/manipulate/work with the data.  We are working on a user/permissions model to make this useable in more situations, as well as for helping in conflict resolution - multiple parties updating the same data differently.

Our goal is to build both a toolset that developers can build upon and a product that end-users can easily use out-of-the box for simple use cases. We are hoping to build a simple way to create data schemas, and a simple data visualization tool based on d3.  Developers will then be able to further customize this for specialized use-cases.  

Our current stack from 10,000 feet:

server/p2p peer:<br>
sqlite (db)<br>
node.js express (server)<br>
persistence.js (sync)<br>
mdns (zeroconf discovery)<br>
websocket (p2p communication) [soon]<br>
html5 offline app - serve resources<br>
<p>
in-browser client/p2p peer:<br>
html5 browser supporting webSQL<br>
html5 offline app - manifest/appCache<br>
persistence.js (sync)<br>
d3js (visualizations) [soon]<br>
QR code (quick nav for smartphones)<br>
websocket (p2p communication) [soon]<br>
