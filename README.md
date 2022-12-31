# simple-webrtc-p2p-game-relay

A web socket based relay server for the simple webrtc p2p example.

## Introduction

This repository holds a simple relay server used to pass text messages between browsers (or other) connected with a websocket. It's intended to be the simplest naive implementation possible and to be hosted on AWS Beanstalk. 

Each user connects and presents a name. That name is then used to address that user and send/receive messages from it. The relay server is simply passing text messages between the clients.

This server was created to support the sample at: https://github.com/kevglass/simple-webrtc-p2p-game

There is a default implementation running at time of writing at:

Secure: node4.cokeandcode.com
