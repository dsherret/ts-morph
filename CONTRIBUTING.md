# Logging Bugs

1. Start logging an issue in the [issue tracker](https://github.com/dsherret/ts-morph/issues).
1. Clearly identify the problem and submit some reproduction code.
    * Prune the reproduction to remove needless details.
1. State the current and expected behaviour.
1. State the version of ts-morph (always show a reproduction of the bug on the latest version).

# Contributing Bug Fixes

1. Follow the instructions above about logging a bug. In addition:
    1. State that you are going to work on the bug.
    1. Discuss major structural changes in the issue before doing the work to ensure it makes sense and work isn't wasted
1. Start working on the fix in a branch of `master` and submit a PR when done.

# Contributing Features

1. Log an issue in the [issue tracker](https://github.com/dsherret/ts-morph/issues). In the issue:
    1. Propose the change.
        * Outline all changes that will be made to the public API.
        * Discuss any structural changes to the code if necessary.
    1. Wait for discussion and green light from [@dsherret](https://github.com/dsherret) (who will try to reply as soon as possible, but it might take a few days).
        * Note: If the change is small and you think it wouldn't take you too much time, then feel free to start working on it and even submit a PR. Just beware that you're taking the risk that it could be denied.
1. After approval, start working on the change in a branch of `master` and submit a PR.

# Getting Started

Run in root of repo:

```bash
# installs, sets up, and builds all the packages for development
yarn setup
```

Then there's the following projects:

* [packages/ts-morph](packages/ts-morph)
* [packages/bootstrap](packages/bootstrap)
* [packages/common](packages/common) - Common code used by both of the packages above.
* [packages/scripts](packages/scripts) - Common scripts used at development time by both packages.

# Commands

```bash
# build (run in root dir or per package)
yarn build
# run tests (run in root dir or per package)
yarn test
# format (this is kind of experimental as it's using a formatter I wrote... let me know if it does anything strange)
yarn format
```
