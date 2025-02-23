import React from 'react'
import { ShowPropertyProps } from 'adminjs'

const ValuesList: React.FC<ShowPropertyProps> = (props) => {
    const { property, record } = props
    const error = (record.errors && record.errors[property.path]) || {}

    return <ul>
        {Object.keys(property.custom.values).filter(k => record.params[k]).map(function(key){  
            const path = `${property.path}.${key}`
            const value = (record.params && record.params[path]) || false

            return <li key={key}>
                {property.custom.values[key]}
            </li>
        })}
    </ul>;
}


export default ValuesList