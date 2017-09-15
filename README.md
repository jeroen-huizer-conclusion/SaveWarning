# Save warning

## Description
Users can easily navigate away from a page without committing their changes.
Though this is not wrong perse, it is not always intuitive to users and it can lead to loss of data.

This widget checks the object on the page when the user navigates away. 
If there are any changes it will present a warning to the user.
The warning message and the subsequent options available to the user are customizable.
For example: you can allow the user to commit or rollback from the popup or trigger some custom microflow.

## Features:
- Show a message (blocking) when there are changes to the contextobject when leaving the page
- Does not show anything if there are no changes
- No need for custom logic to check for changes.
- Define your own action buttons
	-	commit
	-	rollback
	-	microflow
	-	navigate back
	-	do nothing

## Limitations
- Widget only tracks changes to the contextobject and not to any referenced objects.
- When committing from the popup, it is not possible to show validation messages.
- 'Go back' does not work  in popup windows

## Dependencies

- [Mendix 7.x or higher](https://appstore.mendix.com/)

## Configuration

Add the .mpk in dist to your project.
Add the widget to a dataview and follow the configuration steps.

## Attribution
- Icon made [PAO Media](https://www.iconfinder.com/paomedia), licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/legalcode)