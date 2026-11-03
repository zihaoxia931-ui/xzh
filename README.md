# Encrypted personal workspace

GitHub Pages publishes only the invitation landing page, browser decryption code, encrypted key envelopes and an AES-256-GCM encrypted document. No readable work records, contact lists, source photographs or invite codes are included. Original editable source remains in a separate private repository.

Invite codes derive wrapping keys using PBKDF2-SHA256 (300,000 iterations); each code wraps a random 256-bit content key. No password or content key is stored in plaintext.

This is static file encryption, not server authentication: a code holder can keep or forward the decrypted document. The expiry check is a browser convenience, not cryptographic or server-enforced revocation. Do not rely on it to withdraw previously downloaded material.
