# snips-action-timer

### Snips action code for the Timer app

[![Build Status](https://travis-ci.org/snipsco/snips-action-timer.svg?branch=master)](https://travis-ci.org/snipsco/snips-action-timer)

## Setup

```sh
# Install the dependencies, builds the action and creates the config.ini file.
sh setup.sh
```

Don't forget to edit the `config.ini` file.

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

## Run

- Dev mode:

```sh
# Dev mode watches for file changes and restarts the action.
npm run dev
```

- Prod mode:

```sh
# 1) Lint, transpile and test.
npm start
# 2) Run the action.
npm run launch
```

## Test & Demo cases

This app only supports french 🇫🇷 and english 🇬🇧.

### `SetTimer`

#### Set a timer optionally with a name

Set a timer with the given time
> *Hey Snips, create a timer for 25 minutes*

Set a timer with the given time and name
> *Hey Snips, set the homework timer for 30 minutes*

### `GetRemainingTime`

#### Get the remaining time of a timer, optionally for a specific timer name or duration

Get the remaining time of the current timers
> *Hey Snips, I want an update on my timer*

Get the remaining time of the timer with the given duration
> *Hey Snips, when will be my 7 minute timer finished?*

Get the remaining time of the timer with the given name
> *Hey Snips, when is the pizza timer done?*

### `PauseTimer`

#### Pause a timer, optionally for a specific timer name or duration

Pause all the current timers
> *Hey Snips, can you pause all my timers*

Pause the timer with the given duration
> *Hey Snips, pause my 5 minute timer please*

Pause the timer with the given name
> *Hey Snips, I would like to pause my yoga timer*

### `ResumeTimer`

#### Resume a timer, optionally for a specific timer name or duration

Resume all the current timers
> *Hey Snips, resume all of my active timers*

Resume the timer with the given duration
> *Hey Snips, I'd like you to resume my 1 hour timer*

Resume the timer with the given name and duration
> *Hey Snips, start again my 10 minute pasta timer*

### `CancelTimer`

#### Cancel a timer, optionally for a specific timer name or duration

Cancel all the timers with the given name
> *Hey Snips, please cancel all my yoga workout timers*

Cancel the timer with the given duration
> *Hey Snips, I'd like you to cancel my 4 minute timer*

Cancel the timer with the given name and duration
> *Hey Snips, cancel my 2 minute shower timer please*

## Debug

In the `src/index.ts` file:

```js
// Replace 'error' with '*' to log everything
logger.enable('error')
```

## Test

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm run test
```

**In test mode, i18n output is mocked.**

- **i18n**: mocked by `snips-toolkit`, see the [documentation](https://github.com/snipsco/snips-javascript-toolkit#i18n).
