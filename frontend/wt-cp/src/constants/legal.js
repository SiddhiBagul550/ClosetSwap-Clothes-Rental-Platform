export const LEGAL_CONTENT = {
  terms: {
    title: "Terms of Service",
    sections: [
      ["1. Acceptance", "By creating an account you agree to these terms. This is a draft template pending legal review, not a final legal document."],
      ["2. Accounts", "You must give accurate information when you sign up. Shop accounts must provide a genuine GSTIN or business registration number; misrepresenting an individual account as a shop, or vice versa, may lead to suspension."],
      ["3. Listings & bookings", "Closet Swap connects people who have clothing to rent with people who want to rent it. We are not a party to the rental agreement between a renter and a lender or shop."],
      ["4. Payment & deposits", "Any payment or deposit is arranged directly between the renter and the lender or shop unless the app states otherwise at checkout. Closet Swap is not responsible for resolving payment disputes between users."],
      ["5. Condition & disputes", "Renters and lenders are expected to resolve damage, loss, or condition disputes between themselves in good faith. Closet Swap may help mediate but doesn't guarantee an outcome."],
      ["6. Suspension", "We may suspend or remove an account that provides false information, violates these terms, or is reported for abusive behaviour."],
      ["7. Changes", "We may update these terms as the product evolves. Continued use after a change means you accept the update."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["1. What we collect", "Name (or shop name), contact number, address, password (stored as a hash, never in plain text), and, for shop accounts, the owner's name and GSTIN."],
      ["2. How we use it", "To create and secure your account, show your listings to nearby renters, and share pickup/contact details with the other side of a confirmed booking."],
      ["3. How we share it", "Your contact number and address are shared with a renter or lender only once a booking between you is confirmed. We do not sell your information to third parties."],
      ["4. Security", "Passwords are hashed with bcrypt. Sessions use a signed token stored in your browser."],
      ["5. Your rights", "You can ask us to access, correct, or delete your account data at any time."],
      ["6. Changes", "This is a draft template pending legal review. We'll update it as the product and its data practices evolve."],
    ],
  },
};
