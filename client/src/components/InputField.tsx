import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'


interface InputFieldProps {
    name: string
    label: string
    placeholder: string
    type: string
}

const InputField = (props  : InputFieldProps) => {
    const [field, {error}] = useField(props)
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}> {props.label} </FormLabel>
            {/* ...field hay ...props co nghia la se trai tat ca cac thuoc tinh cua props do */}
                <Input {...field} id={field.name} {...props}></Input>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}

export default InputField
