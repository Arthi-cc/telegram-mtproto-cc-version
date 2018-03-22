//@flow

import { writeFileSync, ensureDirSync } from 'fs-extra'
import { type Stream } from 'most'
import { join } from 'path'

const DIR = 'snippet'

const makeName = (name: string[], index: number) => join('.', DIR, ...name, [index.toString(10), '.json'].join(''))

const makeSnippet = (name: string[]) => {
  ensureDirSync(join('.', DIR, ...name))
  return (filter: any, epic: (action$: Stream<any>) => Stream<any>) => (action$: Stream<any>) => {
    const mcast = action$.thru(filter).multicast()
    const raw = epic(mcast)
    const counter = mcast
      .scan(n => n+1, 0)
      .skip(1)
    mcast
      .zip((begin, end) => ({ begin, end }), raw)
      .zip((data, count) => ({ ...data, count }), counter)
      .observe(({ begin, end, count }) => {
        const fullName = makeName(name, count)
        const stringify = stringifyOnce({ begin, end }, 2, replacer)
        writeFileSync(fullName, stringify)
      })
    return raw
  }
}

const isAxios = (val: mixed) => typeof val === 'object' && val != null
  && val.request != null
  && val.headers != null

const printArrayBuffer = (val: ArrayBuffer) => `ArrayBuffer [${(new Int32Array(val)).toString()}]`

const replacer = (key: string, val: mixed) => {
  if (isAxios(val))
    return printArrayBuffer(val.data)
  return val
}

function stringifyOnce(obj, indent, replacer){
  const printedObjects = []
  const printedObjectKeys = []

  function printOnceReplacer(key, value){
    if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long'
    }
    let printedObjIndex = false
    printedObjects.forEach((obj, index) => {
      if (obj===value){
        printedObjIndex = index
      }
    })

    if ( key == ''){ //root element
      printedObjects.push(obj)
      printedObjectKeys.push('root')
      return value
    }

    else if (`${printedObjIndex}` != 'false' && typeof (value)=='object'){
      if ( printedObjectKeys[printedObjIndex] == 'root'){
        return '(root)'
      } else {
        return '(' + printedObjectKeys[printedObjIndex] + ' ' + ((!!value && !!value.constructor) ? value.constructor.name  : typeof (value)) + ')'
      }
    } else {

      const qualifiedKey = key || '(empty key)'
      printedObjects.push(value)
      printedObjectKeys.push(qualifiedKey)
      if (replacer){
        return replacer(key, value)
      } else {
        return value
      }
    }
  }
  return JSON.stringify(obj, printOnceReplacer, indent)
}

export default makeSnippet
