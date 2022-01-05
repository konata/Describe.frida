import { prettyprint } from './Describe'

setImmediate(() =>
  Java.perform(() => {
    const ContextWrapper = Java.use('android.content.ContextWrapper')
    ContextWrapper.attachBaseContext.implementation = function (
      ...args: any[]
    ) {
      console.log('\n')
      console.error(args)
      console.log('=====vs=====')
      console.error(JSON.stringify(prettyprint(args, 3, 3)))
      return this.attachBaseContext(...args)
    }
  })
)
