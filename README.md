# `Describe.frida`

the missing `Dump` library for frida

## how to use

```typescript
import { prettyprint } from './Describe'
prettyprint(object, 3, 3)
```

opt-in `depth` and `hierarchyLimit` to avoid noisy while get rid of circurlarly reference
