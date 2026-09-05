# Project rules

## General

- Inspect the existing code before making changes.
- Preserve existing functionality and business logic unless the task explicitly requires changing it.
- Do not modify unrelated files.
- Prefer simple solutions over unnecessary abstractions.
- Reuse existing components, hooks and utilities whenever appropriate.
- Do not introduce dependencies unless they are genuinely necessary.
- Follow the existing project architecture and conventions.
- Do not make imports on multiple lines - always import on one line.
- When you create a new file, always put one more empty line at the end of the file. Also when updating files do not delete the last empty line.

## React / TypeScript

- Use TypeScript consistently.
- Keep components focused and reasonably small. Write comments in Czech language and keep the same style in the files. Do not alter the existing commments.
- Prefer existing shared UI components over duplicating markup.
- Do not introduce unnecessary state or effects.
- Preserve existing props and behaviour unless there is a good reason to change them.
- Avoid `any` unless there is no reasonable alternative.
- Keep types close to the feature they belong to unless they are genuinely shared.

## CSS

- Reuse existing global styles and shared components where appropriate.
- Avoid duplicating the same CSS rules across components.
- Remove CSS that becomes unused after a refactoring.
- Do not create unnecessarily complicated selectors.
- Prefer clear, natural class names.
- Do not introduce a CSS abstraction merely to avoid a few lines of CSS.
- Preserve the existing visual appearance unless the task explicitly concerns the design.

## Refactoring

- Refactoring should improve structure without changing behaviour.
- Before creating a new component, check whether an existing component can be reused.
- Before adding CSS, check whether an existing class or shared component already provides the required styling.
- Do not perform unrelated cleanup while working on a specific task.
- Do not rename files, variables or components unless necessary for the task.

## Validation

After making changes:

1. Check for TypeScript errors.
2. Run the project's build command.
3. Fix errors caused by the changes.
4. Check for unused imports and unused CSS.
5. Review the final diff for unrelated changes.

If validation cannot be performed, clearly state what could not be checked.