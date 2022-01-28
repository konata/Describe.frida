const JCollection = Java.use('java.util.Collection').class
const JMap = Java.use('java.util.Map').class
const $Entry = Java.use('java.util.Map$Entry')
const JObject = Java.use('java.lang.Object')
const Modifier = Java.use('java.lang.reflect.Modifier')

type JsonValue =
  | string
  | Array<JsonValue>
  | Map<string, JsonValue>
  | { [_: string]: JsonValue }

export function describe(
  wrapped: any,
  depth: number = 5,
  hierarchyLimit: number = 2,
  ignoreStatics = true
) {
  return JSON.stringify(
    prettyprint(wrapped, depth, hierarchyLimit, ignoreStatics)
  )
}

export function prettyprint(
  wrapped: any,
  depth: number,
  hierarchyLimit: number,
  ignoreStatics: boolean
): JsonValue {
  const type = typeof wrapped
  const runtimeType = wrapped?.getClass?.() // wrapped && wrapped.getClass && wrapped.getClass()
  const runtimeTypeRepr = runtimeType?.toString?.()
  const declareType = wrapped?.class
  const declareTypeRepr = declareType?.toString?.()
  const describable =
    'String Integer Long Double Float Byte Short Character Boolean'
      .split(/\s+/g)
      .map((it) => `class java.lang.${it}`)
  const primitives = `boolean string number`
  if (hierarchyLimit <= 0) {
    return `${wrapped}`
  } else if (wrapped === null || wrapped === undefined) {
    return `null`
  } else if (
    // 1. primitives
    primitives.includes(type) ||
    describable.includes(runtimeTypeRepr) ||
    describable.includes(declareTypeRepr)
  ) {
    return wrapped.toString()
  } else if (
    (runtimeType === undefined && declareTypeRepr === undefined) ||
    runtimeTypeRepr?.startsWith('class [')
  ) {
    // 2. js aware arrays & java aware array
    if (depth <= 0) {
      return `${wrapped}`
    } else {
      return [...wrapped].map((it) =>
        prettyprint(it, depth - 1, hierarchyLimit, ignoreStatics)
      )
    }
  } else if (
    (declareType && JCollection.isAssignableFrom(declareType)) ||
    (runtimeType && JCollection.isAssignableFrom(runtimeType))
  ) {
    // 3. Collection [List, Set, Etc]
    if (depth <= 0) {
      return `${wrapped}`
    } else {
      return [...wrapped.toArray()].map((it) =>
        prettyprint(it, depth - 1, hierarchyLimit, ignoreStatics)
      )
    }
  } else if (
    (declareType && JMap.isAssignableFrom(declareType)) ||
    (runtimeType && JMap.isAssignableFrom(runtimeType))
  ) {
    // 4. Map
    if (depth <= 0) {
      return `${wrapped}`
    } else {
      return [...wrapped.entrySet().toArray()].reduce((acc, ele) => {
        const key = $Entry.getKey.call(ele).toString()
        const value = $Entry.getValue.call(ele)
        acc[key] = prettyprint(value, depth - 1, hierarchyLimit, ignoreStatics)
        return acc
      }, new Map<string, JsonValue>())
    }
  } else {
    // 5. Pojo, choose the most accuracy type
    const clazz =
      runtimeType ||
      (() => {
        const casted = Java.cast(wrapped, JObject)
        return casted?.getClass?.() ?? casted?.class
      })() ||
      declareType

    // declareType
    if (clazz) {
      const [fields] = [...Array(hierarchyLimit).keys()].reduce(
        ([tuples, clazz], level) => {
          const acc = [...(clazz?.getDeclaredFields?.() ?? [])]
            .filter(
              (it) => !ignoreStatics || !Modifier.isStatic(it.getModifiers())
            )
            .map((it) => it.getName() as string)
            .map(
              (it) =>
                [
                  it,
                  prettyprint(
                    wrapped[it]?.value,
                    depth - 1,
                    hierarchyLimit - level - 1,
                    ignoreStatics
                  ),
                ] as [string, JsonValue]
            )
          const supers = clazz?.getSuperclass()
          return [[...tuples, ...acc], supers]
        },
        [[] as [string, JsonValue][], clazz]
      )
      return fields.reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {} as Record<string, JsonValue>
      )
    } else {
      // not primitive, not js array, no declaredType no runtimeType, who are u?
      console.error(
        `wired:${wrapped}  runtimeType:${runtimeType}  declType:${declareType}`
      )
      return `BadPojo@${wrapped}`
    }
  }
}
