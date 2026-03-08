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
} from '@jsonforms/core';
import { vanillaRenderers } from '@jsonforms/vanilla-renderers';

import { ReactSelectRenderer } from './select';
import { FieldRenderer } from './field';
import { DateTimeRenderer } from './datetime';
import { TriStateCheckboxRenderer } from './tristate';

const fieldTester = rankWith(3, or(isStringControl, isNumberControl, isIntegerControl));
const reactSelectTester = rankWith(5,
  or(
    isEnumControl,
    schemaMatches((schema) => schema.type === 'array' && !!(schema as any).items?.enum),
  )
);
const dateTimeTester = rankWith(5, or(isDateControl, isTimeControl, isDateTimeControl));
const booleanTester = rankWith(5, isBooleanControl);

export const renderers = [
  ...vanillaRenderers,
  { tester: fieldTester, renderer: FieldRenderer },
  { tester: reactSelectTester, renderer: ReactSelectRenderer },
  { tester: dateTimeTester, renderer: DateTimeRenderer },
  { tester: booleanTester, renderer: TriStateCheckboxRenderer },
];