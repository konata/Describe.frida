# `Describe.frida`

the missing `Dump` library for frida

## why?

to get more meaningful information about an object rather than `[Object object]`

## how ?

```typescript
import { prettyprint } from './Describe'
prettyprint(object, 3, 3)
```

opt-in `depth` and `hierarchyLimit` to avoid noisy while get rid of circurlarly reference
