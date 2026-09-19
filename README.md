# @kaoie-rtp/better-fetch

> A lightweight, zero-dependency fetch wrapper for Browsers and Node.js

## 📦 Installation

```bash
npm install @kaoie-rtp/better-fetch
```

## 🚀 Quick Start

```ts
import fetcher from '@kaoie-rtp/better-fetch';

const api = fetcher({
  base: 'PUT YOUR BASE URL HERE',
});

interface User {
  id: number;
  name: string;
  email: string;
}

// GET Request
const users = await api.get<User[]>('/path');
console.log(users);

// POST Request
const newUser = await api.post<User>('/path', {
  name: 'John Doe',
  email: 'john@example.com',
});
console.log(newUser);
```
