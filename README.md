# @epiijs/server

A simple server framework.

- functional pipeline
- file-system based routor
- handler-in-action filter
- service dependency injection

`v3.x` is only for ES module. 

# Install

```bash
npm i @epiijs/server --save
```

# Usage

## project like this

```sh
(root)
├─ src
│  ├─ actions
│  │  ├─ $params
│  │  │  └─ index.ts
│  │  └─ index.ts
│  └─ services
│     └─ service.ts
└─ start.ts
```

will routes requests like this

```
=> /$params
=> /
```

## start server
```ts
import { startServer } from '@epiijs/server';

startServer({
  name: 'your-server',
  port: 8080,
  path: {
    root: __dirname // or getDirNameByImportMeta(import.meta)
  }
});
```

## handle request by *action*

Provide request handlers in `/actions`.

```ts
import {
  ActionResult,
  IncomingMessage
} from '@epiijs/server';

export default async function (props: IncomingMessage): Promise<ActionResult> {
  const { method, url } = props;

  // simple response
  return 'hello world';
  
  // custom response
  return {
    status: 400,
    headers: { 'content-type': 'application/json' },
    content: JSON.stringify({})
  };

  // or you can throw error
  throw new Error('fatal error');
}
```

## filter pipeline by handler in action

Use `useHandler` to filter request and dispose after *action* called.

```ts
import {
  ActionResult,
  Context,
  IncomingMessage
} from '@epiijs/server';

export default async function (props: IncomingMessage, context: Context): Promise<ActionResult> {
  const { method, url } = props;

  await context.useHandler(dispose => {
    const start = Date.now();
    if (method !== 'GET') {
      return { status: 405, content: 'method not allowed' };
    }
    dispose(() => {
      console.log('elapsed', Date.now() - start);
    });
  });
  
  return 'hello world';
}
```

## inject *service* as dependency

Provide service factory in `/services`.

```ts
export interface IUserService {}

export default function createUserService() {
  const userService: IUserService = {};
  return userService;
}
```

Use `useService` in *action* to get service instance.

```ts
import {
  ActionResult,
  Context,
  IncomingMessage
} from '@epiijs/server';

export default async function (props: IncomingMessage, context: Context): Promise<ActionResult> {
  const { method, url } = props;

  const userService = await context.useService('UserService');

  const users = await userService.findUsers();  
  return users;
}
```

## Document

WIP

* global error handling
* declare action and service