# get-mail-server

Get hostname of the mail server where incoming emails should be delivered for a given domain.

## Installation

```sh
$ npm install @bredele/get-mail-server
```

## Usage

```ts
import getMailServer from "@bredele/get-mail-server";

await getMailServer("example.com");
await getMailServer("example.com", { timeout: 1000 });
```

## Notes

This module default to a 5 seconds timeout as DNS lookups can hang indefinitely if servers are slow/unresponsive, blocking your application.
