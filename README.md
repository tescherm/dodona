# dodona
A browser based real time activity monitor

![screen shot 2015-06-21 at 8 42 59 pm](https://cloud.githubusercontent.com/assets/199097/8275314/ce9d5be6-1857-11e5-8f98-91d677b2548a.png)

## Overview

Dodona is an [activity monitor](https://en.wikipedia.org/wiki/Activity_Monitor) service implemented in node that collects system metrics (right now metrics that node gives you for free like CPU, memory, and load average, as well as disk metrics using statvfs) and presents them in real time.  Dodona consists of a few components:

* **Metric Collectors** - Metric Collectors are modules that collect system metrics (cpu, disk, memory, etc.)
* **Metric Reporter** - The Metric Reporter reports system metrics to dodona via the firehose API. Metrics are json objects with [metrics.2.0](http://metrics20.org/spec/) style fields (`unit`, `type`, `what`, etc.)
* **Firehose Service** - The Firehose Service serves the firehose API that metric reporters send to. Under the covers the interaction between metric reporters and the firehose service uses an [axon](https://github.com/tj/axon) based push/pull style of communication over tcp, where multiple metric reporters may push metrics to a firehose service. The firehose service also runs an axon publisher that clients may connect to. The publisher exposes a single `points` topic that yields all points send to the firehose API. 
* **API Service** - At the moment the API Service simply serves dashboards via a `/dashboards` REST resource, although it could do more. See [mock-dashboards](https://github.com/tescherm/dodona/blob/master/api-service/misc/mock-dashboards.js) for an example dashboard.
* **UI Service** - Serves the app and runs a websocket server used to stream data points from the server to the browser. The UI Service connects to the Firehose Service's `points` topic and routes points to the websocket server. The app itself uses [react](http://facebook.github.io/react/) along with the [flux pattern](https://facebook.github.io/flux/docs/overview.html), and [c3js](http://c3js.org/) for charting.

This interaction beteween these services is illustrated by the following diagram:

![dodona](https://cloud.githubusercontent.com/assets/199097/8275891/3ff11192-1863-11e5-87e5-b99516008fb6.png)

## Installation

Run ```npm install``` to download dependencies:

```bash
npm install
```
## Running

To run in development mode, run the grunt server task:

```bash
grunt server
```

Visit [http://localhost:3030](http://localhost:3030) in your browser to view the app.

**Other Tasks**

```grunt lint``` - Runs eslint lint tests

```grunt test``` - Runs unit tests

```grunt build``` - Runs all lint and unit tests.

```grunt artifact``` - Runs ```grunt build``` and creates a build artifact.
