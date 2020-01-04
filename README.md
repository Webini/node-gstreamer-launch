# Installation

You must have `gst-launch-1.0` installed on your system (in package `gstreamer1.0-tools` for debian based distributions)

`npm i node-gst-tools`

## About

This package is a simple utiliy helping you to build gstreamer pipelines.

## Linear pipeline example

```js
const gst = require('node-gstreamer-launch');

const gstProcess = gst
  .pipeline(gst.element('fakesrc', { 'num-buffers': 10 }))
  .next(gst.caps('video/x-raw', { width: [640, 'int'], height: 220 }))
  .next(gst.element('fakesink'))
  .execute({ debug: true });
// execute return https://nodejs.org/api/child_process.html#child_process_class_childprocess
// debug: true will display the command line with parameters executed

// it will execute
// gst-launch-1.0 -e  fakesrc num-buffers=10 ! video/x-raw,width=(int)640,height=220 ! fakesink
```

## Forked pipeline example

```js
const gst = require('node-gstreamer-launch');

const entryPipe = gst
  .pipeline(gst.element('fakesrc', { 'num-buffers': 10 }))
  .next(gst.element('progressreport', { name: 'myProgress', 'update-freq': 1 }))
  .next(gst.element('tee', { name: 'buffers' }));

// fork parameter is the first pipe item, empty parameters is allowed
const output0 = entryPipe.fork(
  entryPipe.element('fakesink', { name: 'output0' }),
);
const output1 = entryPipe.fork(gst.element('fakesink', { name: 'output1' }));

entryPipe
  .fork(entryPipe.link('buffers'))
  .next(gst.element('queue'))
  .next(output0.link('output0'));

entryPipe
  .fork(entryPipe.link('buffers'))
  .next(gst.element('queue'))
  .next(output1.link('output1'));

// always execute from the pipe who's forked
entryPipe.execute({ debug: true });

// it will execute
// gst-launch-1.0 -e fakesrc num-buffers=10 ! progressreport name=myProgress update-freq=1 ! tee name=buffers \
//  fakesink name=output0 \
//  fakesink name=output1 \
//  buffers. ! queue ! output0. \
//  buffers. ! queue ! output1.
```
