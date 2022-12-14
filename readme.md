# Runner

Little helper that allows executing an array of async function.  

Result of previously executed function can be passed to the args of the next function.  

At the end of the execution it's possible to look at the results of executed functions.

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

There are two ways to execute this set of functions.
### Way number 1:
```typescript
// create helper instance
const runner = new Runner()

// Call the method "executePipeline" to consequently execute your functions
// Argument for the "executePipeline" - an array of items to execute [item1, itme2, ...]
// execution item is an array too
// execution item is [function to run, custom args for the function as an array or a function]
// if instead of array of args a function is passed, the result of previously 
// executed function is available as args of the function
// execution item example 1: 
//      [foo, ['hi', 'you']] => will be in runtime foo('hi', 'you')
// execution item example 2: 
//      [foo, [{a, b}, 'you']] => will be in runtime foo({a, b}, 'you')
// execution items example 3 (function "foo" returns a string) : 
//      [foo, ['hello', 'world']] => will be in runtime foo('hello', 'world')
//      [bar, (resultFromFoo) => [resultFromFoo, anotherArg]] => will be in runtime bar(resultFromFoo, anotherArg)
await runner.executePipeline([
    [foo, ['fooArg1', 'fooArg2']],
    [boo, (fooArg1) => (['lasArg', fooArg1])],
    [las, (lasArgs1, lasArgs2) => ([lasArgs1 + lasArgs2])]
])
```
More realistic example:
```typescript
const runner = new Executer()

const pipline: ArrayToExecute = [
    [createOrder, ['My Essay', 10]],
    [updateOrder, (id) => ([id, 'Amazing Essay'])],
    [hireExpert, ({id}) => [{orderId: id, authorId: 999}]]
]

await runner.executePipeline(...pipline)
```

### Way number 1_2:  
During the pipline execution there can be a case, when you need to get result of a function,
that has been executed few functions ago. For this case you can call a runner saving function after the executed function,
and save the data to internal runner store under the appropriate key. Let's look at the example of using methods: `store`, `fromStore`, `storeKeys`, `resetStore`.

```typescript
const runner = new Executer()

const pipline: ArrayToExecute = [
    [createOrder, ['My Essay', 10]],
    // store result of createOrder in internal storage of runner under key 'orderId'
    [runner.store('orderId', (orderId: any) => orderId)],
    [updateOrder, (id) => ([id, 'Amazing Essay'])],
    // store some other data from prev step (updateOrder) under key 'titleAndOrder'
    [runner.store('titleAndOrder', (prevFuncResult: any) => ({
        title: prevFuncResult.title,
        id: runner.fromStore('orderId')
    }))],
    // use stored 'orderId' in hireExpert, get it from internal store by key: runner.fromStore('orderId')
    [hireExpert, () => [{orderId: runner.fromStore('orderId'), authorId: 999}]]
]
await runner.executePipeline(...pipline)
// get keys of runner internal store 
console.log(runner.storeKeys)
// get value from internal store by key
runner.fromStore('titleAndOrder')
// reset runner internal store (romove all keys and values) - it's not necessary, just cleanup example
runner.resetStore()
```

To store the data use `runner.store` method, where first arg is the key, 
the second arg is a function that get previously executed function result as arg, 
and should return the value that will be saved in internal store under the defined key.  

To get stored data by key use `runner.store(someKey)`

If no key found - there will be an exception thrown.

### Way number 2:

You can create a structure of predefined steps, and combine steps as you wish.  
```typescript
// create names of steps:
enum Steps {
    CREATE_ORDER = 'CREATE_ORDER',
    UPDATE_ORDER = 'UPDATE_ORDER',
    HIDE_ORDER = 'HIDE_ORDER',
    DELETE_ORDER = 'DELETE_ORDER',
    ADD_OFFER_TO_ORDER = 'ADD_OFFER_TO_ORDER',
    ACCEPT_OFFER = 'ACCEPT_OFFER',
    HIRE_EXPERT = 'HIRE_EXPERT'
}

// create helper instance
const runner = new Runner()

// create a structure of steps, where a key - step name, value - an object that
// consists of "func" - function to run, "args" - arguments that are passed to func
// args can be an array, or a function
// if instead of array of args a function is passed, the result of previously 
// executed function is available as args of the function
const possibleExecutionSteps = {
    [Steps.CREATE_ORDER]: {
        func: createOrderFunc,
        args: [arg1, arg2]
    },
    [Steps.UPDATE_ORDER]: {
        func: updateOrderFunc,
        args: (arg) => ([arg, anotherArg])
    },
    [Steps.HIRE_EXPERT]: {
        func: hireExpertFunc,
        args: (objectArg) => [{orderId: objectArg.id, authorId}]
    }, //...
}

// Add the created execution list to runner instance
runner.setExecutionList(possibleExecutionSteps)

// Run so called pipline combining steps as you wish
// Argument for the "executePipeline" - an array of items to execute [item1, itme2, ...]
// execution item is an array too
// execution item is [name of step to run, custom args for the function as an array or a function]
// custom args for the function as an array or a function are optional and just 
// overwrite args in possibleExecutionSteps for the given step
// if instead of array of args a function is passed, the result 
// of previously executed function is available as args of the function
// if you want, you can combine this method of execution function with the "way number 1"
await runner.executePipeline(
    // just some function
    [wait],
    // run the func = possibleExecutionSteps[Steps.CREATE_ORDER].func with args = possibleExecutionSteps[Steps.CREATE_ORDER].args
    [Steps.CREATE_ORDER],
    // run the func = possibleExecutionSteps[Steps.UPDATE_ORDER].func with args = (id, 'Way 2 title update') 
    // defined dynamically based on result (id) of previous step (CREATE_ORDER)
    [Steps.UPDATE_ORDER, (id) => ([id, 'Way 2 title update'])],
    // run the func = possibleExecutionSteps[Steps.HIRE_EXPERT].func with args = possibleExecutionSteps[Steps.HIRE_EXPERT].args
    [Steps.HIRE_EXPERT]  
)
```

Result of all executed function is available at `runner.getExecutionResults()`

Take a look at the example `src/example.ts`.