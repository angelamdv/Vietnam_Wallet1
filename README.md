# Cat Wallet

A responsive, pastel sage-green cat-themed expense tracker.

## Run it
1. Extract the ZIP file.
2. Open `index.html` in a modern web browser.
3. Add expenses using the floating `+` button.

No build tools or dependencies are required.

## Features
- Monthly navigation and VND/PHP totals
- Expense records grouped by date and weekday
- Category selection, notes, date, and time
- VND-to-PHP estimate shown while entering and below each list amount
- Search expenses
- Popup expense form
- Saves records in browser localStorage

## Exchange rate
The demo uses a fixed illustrative rate of `1 VND = 0.0023 PHP`.
For real use, replace `RATE_VND_TO_PHP` in `app.js` with a rate from a trusted exchange-rate API.

## Data storage
Expenses are stored locally in the browser using localStorage. They are not synced between devices or backed up to a server.
