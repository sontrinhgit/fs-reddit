"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegisterInput = void 0;
const validateRegisterInput = (registerInput) => {
    if (!registerInput.email.includes("@"))
        return {
            message: "Invalid Email",
            errors: [
                { field: 'email', message: 'Email must include @ symbol' }
            ]
        };
    if (registerInput.username.length <= 2)
        return {
            message: "Invalid Username",
            errors: [
                { field: 'username', message: 'Length must be greater than 2 ' }
            ]
        };
    if (registerInput.username.includes("@"))
        return {
            message: "Invalid Username",
            errors: [
                { field: 'username', message: 'Username can not have @' }
            ]
        };
    if (registerInput.password.length <= 2)
        return {
            message: "Invalid Password",
            errors: [
                { field: 'password', message: 'Password must be greater than 2' }
            ]
        };
    return null;
};
exports.validateRegisterInput = validateRegisterInput;
