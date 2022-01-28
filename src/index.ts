import { describe } from './Describe'

setImmediate(() =>
  Java.perform(() => {
    const Activity = Java.use('android.app.Activity')
    Activity.onCreate.overloads.forEach((overload: any) => {
      overload.implementation = function (...args: any[]) {
        console.log('activity=', describe(this, 5, 7))
        return overload.apply(this, args)
      }
    })
  })
)
