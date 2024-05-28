# CSRF

To further increase security, this project is protected using [edge-csrf](https://github.com/kubetail-org/edge-csrf).

A csrf token must be present when calling API or server actions. Example:

```typescript
'use client';

import { example1, example2 } from '../lib/actions';

export default function Page() {
  const handleClick1 = async () => {
    const csrfResp = await fetch('/csrf-token');
    const { csrfToken } = await csrfResp.json();

    const data = {
      key1: 'val1',
      key2: 'val2',
    };

    // use token as first argument to server action
    await example1(csrfToken, data);
  };

  const handleClick2 = async () => {
    const csrfResp = await fetch('/csrf-token');
    const { csrfToken } = await csrfResp.json();

    // add token to FormData instance
    const data = new FormData();
    data.set('csrf_token', csrfToken); // also the same when calling API, we set the token to FormData instance
    data.set('key1', 'val1');
    data.set('key2', 'val2');

    await example2(data);
  };

  return (
    <>
      <h2>Server Action Non-Form Submission Examples:</h2>
      <p>NOTE: Look at browser network logs and server console for submission feedback</p>
      <h3>Example with object argument:</h3>
      <button type="button" onClick={handleClick1}>Click me</button>
      <h3>Example with FormData argument:</h3>
      <button type="button" onClick={handleClick2}>Click me</button>
    </>
  );
}
```
