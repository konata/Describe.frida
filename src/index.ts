import { prettyprint } from './Describe'

setImmediate(() =>
  Java.perform(() => {
    // const ContextWrapper = Java.use('android.content.ContextWrapper')
    // ContextWrapper.attachBaseContext.implementation = function (
    //   ...args: any[]
    // ) {
    //   console.log('\n')
    //   console.error(args)
    //   console.log('=====vs=====')
    //   console.log(JSON.stringify(prettyprint(args, 3, 3), null, 2))
    //   return this.attachBaseContext(...args)
    // }

    const Activity = Java.use('android.app.Activity')
    Activity.onCreate.overloads.forEach((overload: any) => {
      overload.implementation = function (...args: any[]) {
        console.log('\n')
        console.error('activity=', this)
        console.log(
          'activity=',
          JSON.stringify(prettyprint(this, 5, 7), null, 2)
        )
        return overload.apply(this, args)
      }
    })
  })
)
