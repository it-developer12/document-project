import User from '@/SampleData/data.json' with { type: 'json' }
interface User {
    code: string
    position: string
    department_1: string
    department_2: string
    name: string
    surname: string
    company: string
}

interface UserEN extends User {
    name_en: string
    surname_en: string
}

const FindUser = (UserId: string) => {
    const user = User.find(user => user.code == UserId)
    if (user) {
        const stateData:User = {
            code: user.code,
            position: user.position,
            department_1: user.department_1,
            department_2: user.department_2,
            name: user.name,
            surname: user.surname,
            company: user.company
        }
        return stateData
    }
}

const FindUserEN = (UserId: string) => {
    const user = User.find(user => user.code == UserId)
    if (user) {
        const stateData:UserEN = {
            code: user.code,
            position: user.position,
            department_1: user.department_1,
            department_2: user.department_2,
            name: user.name,
            surname: user.surname,
            name_en: user.name_en,
            surname_en: user.surname_en,
            company: user.company
        }
        return stateData
    }
}

export default { FindUser, FindUserEN }