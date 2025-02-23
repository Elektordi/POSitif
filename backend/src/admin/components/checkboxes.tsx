import React from 'react'
import { EditPropertyProps } from 'adminjs'
import { Box, Label, CheckBox } from '@adminjs/design-system'

const Checkboxes: React.FC<EditPropertyProps> = (props) => {
    const { property, onChange, record } = props
    const error = (record.errors && record.errors[property.path]) || {}

    return <Box>
        <Label>{property.description}</Label>
        {Object.keys(property.custom.values).map(function(key){  
            const text = property.custom.values[key]
            const path = `${property.path}.${key}`
            const value = record.params[path] || false

            const handleChange = (): void => {
                if (property.isDisabled) return
                onChange(path, !value)
            }

            return <Box
                flexDirection="column"
                marginRight={15}
                key={key}
            >
                <CheckBox
                    id={path}
                    onChange={handleChange}
                    checked={value}
                    disabled={property.isDisabled}
                    {...property.props}
                    />
                <Label
                    htmlFor={path}
                    inline
                    ml="default"
                >
                    {text}
                </Label>
            </Box>
        })}
    </Box>;
}


export default Checkboxes