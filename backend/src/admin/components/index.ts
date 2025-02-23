import { ComponentLoader } from 'adminjs'

export const componentLoader = new ComponentLoader()

export const checkboxesComponent = componentLoader.add('Checkboxes', './checkboxes');
export const valueslistComponent = componentLoader.add('ValuesList', './valueslist');