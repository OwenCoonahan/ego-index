# Bulk Import Scripts

Scripts for populating the Ego Index database with Twitter account analyses.

## Bulk Import

Analyze multiple Twitter accounts and save them to the database.

### Quick Start

**Test with a few accounts:**
```bash
npm run bulk-import:test
```

**Import all curated accounts (~45 accounts):**
```bash
npm run bulk-import
```

**Import custom accounts:**
```bash
npm run bulk-import elonmusk pmarca paulg naval
# or
npx tsx scripts/bulk-import.ts elonmusk pmarca paulg naval
```

### Configuration

Edit `scripts/bulk-import.ts` to customize:

- **DELAY_BETWEEN_ACCOUNTS**: Time between API calls (default: 8 seconds)
- **CURATED_ACCOUNTS**: Default list of accounts to import
- **BASE_URL**: API endpoint (defaults to `http://localhost:3000`)

### Environment Variables

Set `NEXT_PUBLIC_BASE_URL` to use a different API endpoint:

```bash
NEXT_PUBLIC_BASE_URL=https://ego-index.vercel.app npm run bulk-import
```

### What It Does

1. Calls `/api/analyze` for each account
2. Scrapes Twitter data using your existing scrapers (Nitter/RapidAPI)
3. Analyzes ego using AI
4. Saves to Supabase database
5. Uses cache if account was analyzed in last 24 hours
6. Shows progress, errors, and summary

### Curated Accounts

The script includes ~45 hand-picked accounts across categories:
- Tech Founders & CEOs (Elon, DHH, Naval, etc.)
- VCs & Investors (Marc Andreessen, Chamath, etc.)
- Developer Twitter (Kent C. Dodds, Wes Bos, etc.)
- Crypto personalities (Vitalik, Cobie, etc.)
- Content creators (Jack Butcher, Dickie Bush, etc.)

### Expected Runtime

- **3 accounts:** ~30 seconds
- **45 accounts:** ~6-7 minutes (with 8s delays)
- **100 accounts:** ~15 minutes

### Tips

1. **Start small:** Use `bulk-import:test` first
2. **Check your dev server:** Make sure `npm run dev` is running
3. **Check rate limits:** If you get errors, increase `DELAY_BETWEEN_ACCOUNTS`
4. **Re-running:** Cached results will be used for accounts analyzed in last 24h

### Troubleshooting

**"Failed to fetch Twitter data"**
- Nitter instances might be down
- Make sure RapidAPI keys are set in `.env.local`
- Try setting `USE_MOCK_DATA=true` for testing

**"Connection refused"**
- Make sure dev server is running: `npm run dev`
- Check `BASE_URL` is correct

**Rate limiting**
- Increase `DELAY_BETWEEN_ACCOUNTS` to 10-15 seconds
- Split into smaller batches
