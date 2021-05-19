import { ParseResult as PRDescriptionParseResult } from "./changelog-types"
// @ts-ignore
import { parsePRDescription } from "./parsePRDescription"

const ERROR: PRDescriptionParseResult = { type: "error" }
const NO_CHANGES: PRDescriptionParseResult = { type: "no_changes" }

describe("parsePRDescription", () => {
  it("returns error for empty PR description", () => {
    expect(parsePRDescription("")).toEqual(ERROR)
  })

  it("returns error for PR description that does not contain any changelog info", () => {
    expect(
      parsePRDescription(`
# Description

This pull request adds some stuff to the thing so that it can blah.
    `)
    ).toEqual(ERROR)
  })

  it("returns no_changes when the user includes '#nochangelog' hashtag", () => {
    expect(
      parsePRDescription(`
# Description

This pull request adds some stuff to the thing so that it can blah.

#nochangelog
    `)
    ).toEqual(NO_CHANGES)
  })

  it("returns error when no changes have been declared and #nochangelog has not been included", () => {
    expect(
      parsePRDescription(`
# Description

This pull request adds some stuff to the thing so that it can blah.
### Changelog updates

<!-- 📝 Please fill out at least one of these sections. -->
<!-- ⓘ 'User-facing' changes will be published as release notes. -->
<!-- ⌫ Feel free to remove sections that don't apply. -->
<!-- • Write a markdown list or just a single paragraph, but stick to plain text. -->
<!-- 🤷‍♂️ Replace this entire block with the hashtag \`#nochangelog\` to avoid updating the changelog. -->

#### Cross-platform user-facing changes
-
#### iOS user-facing changes
-
#### Android user-facing changes
-
#### Dev changes
-

### Other stuff
      `)
    ).toEqual(ERROR)
  })

  it("returns any changes specified by the PR author", () => {
    expect(
      parsePRDescription(`
# Description

This pull request adds some stuff to the thing so that it can blah.
### Changelog updates

#### Cross-platform user-facing changes
- Added a new button
  for the checkout flow
- Fixed modal close button
#### iOS user-facing changes
- Fixed input focus styles
#### Android user-facing changes
Updated splash screen color
#### Dev changes
- Improved changelog tooling
- Upgraded lodash

### Other stuff

blah
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "androidUserFacingChanges": Array [
          "Updated splash screen color",
        ],
        "crossPlatformUserFacingChanges": Array [
          "Added a new button
      for the checkout flow",
          "Fixed modal close button",
        ],
        "devChanges": Array [
          "Improved changelog tooling",
          "Upgraded lodash",
        ],
        "iOSUserFacingChanges": Array [
          "Fixed input focus styles",
        ],
        "type": "changes",
      }
    `)
  })

  it("allows sections of the changelog to be deleted", () => {
    expect(
      parsePRDescription(`
### Description
blah blah

### Changelog updates

#### iOS user-facing changes
- Fixed input focus styles

### Other stuff

blah
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "androidUserFacingChanges": Array [],
        "crossPlatformUserFacingChanges": Array [],
        "devChanges": Array [],
        "iOSUserFacingChanges": Array [
          "Fixed input focus styles",
        ],
        "type": "changes",
      }
    `)
  })

  it("supports single-level markdown lists", () => {
    expect(
      parsePRDescription(`
### Changelog updates

#### iOS user-facing changes
- Fixed input focus styles
- Added things
- Removed things
- Updated things
    `)
    ).toMatchInlineSnapshot(`
      Object {
        "androidUserFacingChanges": Array [],
        "crossPlatformUserFacingChanges": Array [],
        "devChanges": Array [],
        "iOSUserFacingChanges": Array [
          "Fixed input focus styles",
          "Added things",
          "Removed things",
          "Updated things",
        ],
        "type": "changes",
      }
    `)
  })

  it("supports paragraphs of text", () => {
    expect(
      parsePRDescription(`
### Changelog updates

#### iOS user-facing changes
made the modals close a bit faster
by updating the transition gradient

uses a trampoline to avoid the problem
where the click didn't work
    `)
    ).toMatchInlineSnapshot(`
      Object {
        "androidUserFacingChanges": Array [],
        "crossPlatformUserFacingChanges": Array [],
        "devChanges": Array [],
        "iOSUserFacingChanges": Array [
          "made the modals close a bit faster
      by updating the transition gradient",
          "uses a trampoline to avoid the problem
      where the click didn't work",
        ],
        "type": "changes",
      }
    `)
  })
})
