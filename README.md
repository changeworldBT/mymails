# mymails

Terminal access to several mailboxes at once — read, search, send, and one
command that shows every account's inbox merged by time.

Built for the case the usual tools ignore: one person who owns six mailboxes
across providers that disagree about auth, folder names and SASL details.

```
ACCOUNT  DATE              FROM                    SUBJECT
qq       2026-10-20 09:12  王琳                    •季度报表确认  [att]   #42
gmail    2026-10-19 22:04  GitHub                  Re: deploy failed on prod   #41
```

## What is here

| File | Purpose |
|---|---|
| `config.example.toml` | himalaya config covering Gmail, QQ, 126, 163, Outlook and a self-hosted domain |
| `setpass` | stores one account's password or authorization code without echoing it |
| `mailall` | lists envelopes across every configured account, merged and sorted |

## Why not just himalaya

himalaya is the engine and it is good. Two things it leaves to you:

- **One account per command.** `mailall` fans out over every account with stored
  credentials and merges the results, so "what's in my mail" is one command
  instead of six.
- **Provider-specific quirks.** The ones that cost the most time are already
  encoded in `config.example.toml`:

| Provider | Quirk |
|---|---|
| Gmail | Refuses the account password. Needs an App Password with 2FA enabled. Sent/drafts/trash live under `[Gmail]/...`, and a wrong alias makes a send report failure *after* SMTP delivered it — retrying sends duplicates. |
| 163 | Refuses `AUTHENTICATE PLAIN` on IMAP. Use the `LOGIN` command instead. |
| 126 | Advertises SASL-IR and then misbehaves; force the non-inline path. |
| QQ, 126, 163 | Want an `ID` exchange right after login. QQ, 126 and 163 all use an authorization code, not the login password. |
| Outlook | Basic auth is being retired by Microsoft. If IMAP password auth fails, the account needs OAuth. |

## Install

```bash
curl -sSL https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh | PREFIX=~/.local sh
```

Requires himalaya v2.2.0 or newer (the config keys below are the v2 shape).

## Configure

```bash
git clone https://github.com/changeworldBT/mymails ~/.hermes/email
cp ~/.hermes/email/config.example.toml ~/.hermes/email/config.toml
mkdir -p ~/.config/himalaya
ln -sfn ~/.hermes/email/config.toml ~/.config/himalaya/config.toml
chmod 700 ~/.hermes/email/setpass ~/.hermes/email/mailall
```

Replace every `ADDRESS` and `EXAMPLE.COM` placeholder, then store each secret:

```bash
~/.hermes/email/setpass gmail      # prompts, input hidden
~/.hermes/email/setpass --list     # which accounts have a secret
```

Secrets are written to `~/.hermes/email/<account>.pass` with mode 600. The config
never contains a password — it runs `cat` on that file.

Verify one account:

```bash
himalaya -a gmail mailbox list
```

Then everything at once:

```bash
mailall
```

## mailall

```
mailall                newest 10 per account
mailall -n 30          newest 30 per account
mailall --unseen       only unread (dot marks them)
mailall -a qq          one account
mailall invoice        pass a himalaya search query through
```

Accounts are discovered from the `*.pass` files, so an account without a stored
secret is simply skipped rather than reported as broken.

## Notes

- `mailall` calls himalaya once per account, in sequence. Six accounts against
  six IMAP servers is roughly a second or two; nothing is cached and no daemon
  or local index is kept, which is the right trade for mail you check a few times
  a day. If you need full-text search over years of history, add `mbsync` +
  `notmuch` on top instead of growing this.
- Nothing here stores mail. Every command reads from the server.

## License

MIT
