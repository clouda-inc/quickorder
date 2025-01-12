# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.31] - 2022-03-18

## [0.1.30] - 2022-03-15

## [0.1.29] - 2022-03-15

### Fixed

- Add csv file type to the quickorder
- Add toast to display any invalid file is selected
- Corrected some messages to required strings ("Product Not Found")

## [0.1.28] - 2022-03-15

## [0.1.27] - 2022-03-15

### Changed

- Lead time attribute name changed in JDE

## [0.1.26] - 2022-03-13

### Fixed

- Lead time mapping issue fixed
- Adding spread sheet download link in quick order

## [0.1.25] - 2022-03-13

## [0.1.24] - 2022-03-13

### Fixed

- Fix linting issues
- Upper case unit of measure field name
- Lead time field name changed to `JDE_Lead_Time`

## [0.1.23] - 2022-03-06

## [0.1.22] - 2022-03-06

### Changed

- Get MOQ, UOM and Lead Time from specifications for JDE and SAP

## [0.1.21] - 2022-03-01

### Fixed

- Add to cart button disabled before validation completes

## [0.1.20] - 2022-03-01

## [0.1.19] - 2022-03-01

### Fixes

- Stock status changed to `Unauthorized`, `In Stock` and `Out of Stock`
- Highlight on errors
- Show meaningful error message
- Quick order table style fixes

## [0.1.18] - 2022-02-24

### Fixed

- Disable add to cart when out of stock
- fixed more buttons not showing issue

## [0.1.17] - 2022-02-24

### Fixed

- Fixed vendor name

## [0.1.16] - 2022-02-23

## [0.1.15] - 2022-02-15

### Changed

- Add to cart not working in upload file
- Add to cart quantity is incorrect

## [0.1.14] - 2022-02-11

## [0.1.13] - 2022-02-11

### Fixed

- Add to cart quantity not correct issue

### Added

- Add JDE pricing table
- Add JDE available quantity
- Add quantity ordered to the table

## [0.1.12] - 2022-02-10

### Added

- Added spinner to indicate loading state of quickorders

## [0.1.11] - 2022-02-09

### Fixed

- Read `UO` documents in health check

## [0.1.10] - 2022-02-09

### Fixed

- Added timestamp to logs

## [0.1.9] - 2022-02-08

### Fixed

- Increased TTL of service

## [0.1.8] - 2022-02-07

## [0.1.7] - 2022-02-04

### Changed

- Changed health check URL to resolve conflict

## [0.1.6] - 2022-02-04

### Added

- Added health check end-point

## [0.1.5] - 2022-02-03

## [0.1.4] - 2022-02-03

- Implement restrict quickorder for Sold to Accounts only

## [0.1.3] - 2022-01-25

## [0.1.2] - 2022-01-25

### Fixed

- Fix linting issues in catalog.ts file

## [0.1.1] - 2022-01-25

## [0.1.0] - 2022-01-25

### Changed

- Release minor version suggested by vtex

## [0.0.15] - 2022-01-25

## [0.0.14] - 2022-01-25

### Changed

- merge linting fixes from new table design

## [0.0.13] - 2022-01-25

## [0.0.12] - 2022-01-25

### Changed

- Release new minor with telemetry changes

## [0.0.11] - 2022-01-25

### Added

- Added performance telemetry logs

### Changed

- New field mappings for new table design
- Frontend changes in new table

### Fixed

- Fix linting issues
- Fixed add to cart button unavailability
- Fixed linting issues in node folder

## [0.0.10] - 2022-01-20

## [0.0.9] - 2022-01-20

## [0.0.8] - 2021-11-22

### Fixed

- Changed vendor to production
- Handled null issues on SKU availability

## [0.0.7] - 2021-11-09

### Fixed

- Fix linting issues.

## [0.0.6] - 2021-11-09

## [0.0.5] - 2021-11-09

### Fixed

- Remove unwanted columns from review table
- Fix add to cart issues
- Fix numeric stepper.
- Fix the quantity validation against MOQ and UM.
- Fix the add to cart quantity.
- Fix the add to cart behaviour in pdp search.

## [0.0.4] - 2021-11-01

## [0.0.3] - 2021-10-29

### Fixed

- Added the Avble qty for bulk order.
- Fixed the duplicate sku addition

## [3.5.1] - 2022-01-21

### Fixed

- Fixed typo

## [3.5.0] - 2022-01-14

### Added

- Ability to run SonarCloud external PR after checking the code by adding a label to it

### Changed

- Sellers API

### Updated

- Code linting

## [3.4.2] - 2022-01-11

### Fixed

- Restricting the Quick Order Upload to accept only .xls and .xlsx files

## [3.4.1] - 2022-01-07

## [3.4.0] - 2021-12-29

## [3.3.2] - 2021-12-21

### Fixed

- Widened the quickorder table

## [3.3.1] - 2021-12-17

### Fixed

- Fixed a bug where the add to cart button will spin forever when given a faulty item SKU

## [3.3.0] - 2021-12-13

### Added

- Displayed the unit modifier value for all items that have it

## [3.2.0] - 2021-05-17

### Added

- Thumb to category module
- Reference code to category module
- New CSS handles to all the modules

### Changed

- Thumb size for the selected item on the One-by-One module

### Removed

- Default `styles.css` file

## [3.1.4] - 2021-04-28

## [3.1.3] - 2021-02-25

### Fixed

- Ignore duplicated refId

## [3.1.2] - 2020-12-01

### Fixed

- Allow the app to access all the orderForms to properly run the simulation

## [3.1.1] - 2020-11-30

### Fixed

- Unmapped status message

### Added

- New status message to translation

## [3.1.0] - 2020-11-04

### Added

- Extra error messages at the preview for `Copy n Paste` and `Upload` components
- Validate items before sending to the Cart and ignore items with error

## [3.0.8] - 2020-11-04

### Fixed

- New terms of use

## [3.0.7] - 2020-10-14

### Fixed

- Doc review and update

## [3.0.6] - 2020-10-14

## [3.0.5] - 2020-10-14

### Added

- Romanian translation

## [3.0.4] - 2020-10-13

### Fixed

- Products on subcategories not being loaded

## [3.0.3] - 2020-09-10

### Added

- New metadada folder structure
- License files
- Localization file

## [3.0.2] - 2020-08-18

### Fixed

- Categories loading
- Default Seller

## [3.0.1] - 2020-08-17

### Changed

- Removed dependency on `vtex.search`
- Updated billingOptions
- Dependencies update
- Updated app store assets

### Fixed

- Missing keys loading categories
- Toast messages

## [3.0.0] - 2020-07-21

### Updated

- APP's icon update
- Documentation

### Added

- `billingOptions` to the `manifest.json`

## [2.1.0] - 2020-07-07

### Added

- New **boolean** property `componentOnly` to the blocks, default value is **true**
- New CSS Handles `textContainer`, `componentContainer` and `buttonClear`
- New Clear button to the selected product at the **Autocomplete** component

## Fixed

- Responsive layout to the `autocomplete` block

## [2.0.1] - 2020-07-01

### Updated

- Document
- `blocks.json` now makes use of `flex-layout` to host all the components by default

## [2.0.0] - 2020-06-29

### Added

- New blocks structure
- New interfaces for blocks `quickorder-textarea`, `quickorder-upload`, `quickorder-autocomplete`, `quickorder-categories`
- Blocks default structure for `store.quickorder`
- Spinner while validatin screen is loading VTEX SKU IDs based on a list of Reference Code

### Fixed

- Sellers selection and auto-selection
- Validation screen lost index after removing an item

### Updated

- Documentation

### Removed

- Single app configuration
- Site Editor Compatibility
- Billing Options
- Translations for Site Editor

## [1.0.2] - 2020-06-19

### Update

- Doc update

## [1.0.0] - 2020-06-19

### Updated

- Changing to major to remove the billing option

## [0.9.3] - 2020-06-19

### Fixed

- Sellers listing not loaded

## [0.9.2] - 2020-06-18

### Removed

- Removed billingOption from the manifest

## [0.9.1] - 2020-06-12

### Added

- Link to the cart on the Toaster success message

## [0.9.0] - 2020-06-12

### Added

- Feedback message from the checkout
- Seller selector if the store have more than one

### Fixed

- Seller always being set as `1`

## [0.8.2] - 2020-06-10

### Added

- Download a spreadsheet model for the Upload component
- CSS Handle `downloadLink`
- Dynamic text for the download link (can be updated from Site Editor)

## [0.8.1] - 2020-06-10

### Added

- Loading spinner to the Categories component

## [0.8.0] - 2020-06-09

### Added

- Custom labels for the components

## [0.7.2] - 2020-05-19

## [0.7.1] - 2020-04-30

### Fixed

- Change the Types for **ID** and **Quantity** to `Int` and `Float` to adapt to the new Graphql requirements of the dependency `vtex.checkout-resources`

## [0.7.0] - 2020-04-13

### Added

- New interface option to add items using spreadsheet file
- New CSS Handles for upload component

### Changed

- Doc update

### Fixed

- Translation keys for the editor at the admin

## [0.6.0] - 2020-04-10

### Added

- New interface option to add items from categories
- New CSS Handles for category component

### Changed

- Translation keys pattern
- Doc update

## [0.5.8] - 2020-02-24

- Doc update

## [0.5.7] - 2020-02-24

### Changed

- App's title to only Quickorder (visible at the Admin)
- Autocomplete's layout adjustments (responsive)

### Added

- Toast message when user needs to select one SKU

## [0.5.6] - 2020-02-20

### Fixed

- Merging validated items with the current list
- Preventing app to "re-check" an item's refid if it was already checked

## [0.5.5] - 2020-02-19

### Added

- Initial release with Copy/Paste and One by One modules.
