import { Executer, ArrayToExecute } from './main'


enum Steps {
    CREATE_ORDER = 'CREATE_ORDER',
    UPDATE_ORDER = 'UPDATE_ORDER',
    HIDE_ORDER = 'HIDE_ORDER',
    DELETE_ORDER = 'DELETE_ORDER',
    ADD_OFFER_TO_ORDER = 'ADD_OFFER_TO_ORDER',
    ACCEPT_OFFER = 'ACCEPT_OFFER',
    HIRE_EXPERT = 'HIRE_EXPERT'
}

const examples = async () => {
    await way1().then(console.log)
    await way2().then(console.log)

    async function way2() {
        console.log('Run way2')
        const runner = new Executer()

        const possibleExecutionSteps = {
            [Steps.CREATE_ORDER]: {
                func: createOrder,
                args: ['Title way 2', 100]
            },
            [Steps.UPDATE_ORDER]: {
                func: updateOrder,
                args: (id: number) => ([id, 'Rando title'])
            },
            [Steps.HIRE_EXPERT]: {
                func: hireExpert,
                args: ({id}: {id: number}) => [{orderId: id, authorId: 999}]
            }
        }

        runner.setExecutionList(possibleExecutionSteps)

        await runner.executePipeline(
            [wait],
            [Steps.CREATE_ORDER],
            [Steps.UPDATE_ORDER, (id) => ([id, 'Way 2 title update'])],
            [Steps.HIRE_EXPERT]
        )

        return runner.getExecutionResults()
    }

    async function way1(){

        console.log('Run way1')
        const runner = new Executer()

        const pipline: ArrayToExecute = [
            [createOrder, ['My Essay', 10]],
            [updateOrder, (id) => ([id, 'Amazing Essay'])],
            [hireExpert, ({id}) => [{orderId: id, authorId: 999}]]
        ]
        await runner.executePipeline(...pipline)

        return runner.getExecutionResults()
    }

    function wait() {
        console.log(`Run WAIT\n`)
    }

    function createOrder(title: string, pages: number): any {
        console.log(`Run CREATE ORDER with args:`, {title, pages})
        const id = Math.ceil(Math.random() * 100)
        console.log(`Return RESULT of CREATE ORDER:`, {id}, '\n')
        return id
    }

    function updateOrder(id: number, title: string): {id: number, title: string} {
        console.log(`Run UPDATE ORDER with args:`, {id, title})
        const result = {id, title}
        console.log(`Return RESULT of UPDATE ORDER:`, result, '\n')
        return result
    }

    function hireExpert({orderId, authorId}: {orderId: string, authorId: number}): boolean {
        console.log(`Run HIRE EXPERT with args:`, {orderId, authorId})
        const result = true
        console.log(`Return RESULT of HIRE EXPERT:`, result, '\n')
        return result
    }
}


examples()

