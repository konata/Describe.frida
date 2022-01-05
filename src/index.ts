import { prettyprint } from './Describe'

setImmediate(() =>
  Java.perform(() => {
    const ContextWrapper = Java.use('android.content.ContextWrapper')
    ContextWrapper.attachBaseContext.implementation = function (
      ...args: any[]
    ) {
      console.log(JSON.stringify(prettyprint(args, 3, 5)))
      return this.attachBaseContext(...args)
    }
  })
)
