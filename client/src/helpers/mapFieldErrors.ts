import { FieldError } from "../generated/graphql";


//bien doi mot array thanh mot object, mot mang gia tri error tra ve la mot array thi se reduce ra de thanh mot object 

// [
//     {
//         field: 'username', message: 'some errror'
//     }
// ]

// {
//     username: 'some error'
// }

export const mapFieldErrors = (errors : FieldError[]) : {[key:string]:any}=> {
    return errors.reduce((accumulatedErrors, error) => {
        return {
            ...accumulatedErrors,
            [error.field]: error.message
        }
    }, {})
}