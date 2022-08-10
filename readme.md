#Description

Little helper that allows executing an array of async function.<br><br>
Result of previously executed function can be passed to the args of the next function.<br><br>
At the end of the execution it's possible to look at the results of executed functions;

## How it works

Let's say we have three functions
```typescript
const foo = (fooArg1, fooArg2) => fooArg1
const bar = (barArg) => barArg
const las = (lasArgs1, lasArgs2) => lasArgs
```
and we want to execute them one after another, 
and the result of **foo** should be an arg for **bar**,
and the result of **bar** should be one of args for **las**.

There're two ways to execute this set of functions.
###Way number 1:
```typescript
// create helper instance
const runner = new Runner()
// call the method to execute the given functions
// argument for the method - an array of items to execute
// execution item is and array too
// execution item = [function to run, custom args as array]
// execution item example: [foo, ['hi', 'you']] => will be in runtime foo('hi', 'you')
// execution item example: [foo, [{a, b}, 'you']] => will be in runtime foo({a, b}, 'you')
runner.executePipeline([
    [foo, ['fooArg1', 'fooArg2']],
    [boo, (fooArg1) => (['lasArg', fooArg1])],
    [las, (lasArgs1, lasArgs2) => ([lasArgs1 + lasArgs2])]
])
```