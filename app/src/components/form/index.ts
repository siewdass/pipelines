import {
  rankWith,
  isStringControl,
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isDateControl,
  isDateTimeControl,
  isTimeControl,
  or,
  schemaMatches,
  JsonSchema,
} from '@jsonforms/core';
import { vanillaRenderers } from '@jsonforms/vanilla-renderers';
export { Form } from './Form';

import { ReactSelectRenderer } from './select';
import { FieldRenderer } from './field';
import { DateTimeRenderer } from './datetime';
import { CheckRenderer } from './check';
import { NumberRenderer } from './number';
import './index.css';

const fieldTester = rankWith(3, isStringControl);
const numberTester = rankWith(5, or(isNumberControl, isIntegerControl));
const reactSelectTester = rankWith(5,
  or(
    isEnumControl,
    schemaMatches((schema: JsonSchema) => schema.type === 'array' && !!(schema as any).items?.enum),
  )
);
const dateTimeTester = rankWith(5, or(isDateControl, isTimeControl, isDateTimeControl));
const booleanTester = rankWith(5, isBooleanControl);

export const renderers = [
  ...vanillaRenderers,
  { tester: fieldTester, renderer: FieldRenderer },
  { tester: numberTester, renderer: NumberRenderer },
  { tester: reactSelectTester, renderer: ReactSelectRenderer },
  { tester: dateTimeTester, renderer: DateTimeRenderer },
  { tester: booleanTester, renderer: CheckRenderer },
];
