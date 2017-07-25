Save warning
=============

## Description
Show a warning to the user when navigating away without committing changes.
Present the user with some options, e.g. commit, rollback, continue.

## Features:
- Show a message when the user has changes.
- Does not show anything if there are no changes
- No need for custom logic
- Define your own action buttons (commit, rollback, microflow, navigate back, do nothing)

## Limitations
- Validation messages and commit errors are a bit tricky.
- 'Go back' does not work  in popup windows

## Dependencies

- [Mendix 6.x or higher](https://appstore.mendix.com/)

## Configuration

Add the .mpk in dist to your project.
Add the widget to a dataview and follow the configuration steps.

## Attribution
- Icon made [PAO Media](https://www.iconfinder.com/paomedia), licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/legalcode)