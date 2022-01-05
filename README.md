# `Describe.frida`

the missing `Dump` library for frida

## why?

to get more meaningful information about an object rather than `[Object object]` or `android.app.ContextImpl@f363a64`

## how ?

```typescript
import { prettyprint } from './Describe'
console.log(JSON.stringify(prettyprint(object, 3, 3)))
```

opt-in `depth` and `hierarchyLimit` to avoid noisy while get rid of circurlarly reference
