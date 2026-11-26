![DompetKeluarga — best household budget site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)
![DompetKeluarga rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Richkys1/best-household-budget-site-20261126-1457/rank.svg)
![DompetKeluarga reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Richkys1/best-household-budget-site-20261126-1457/reward.svg)

# DompetKeluarga — Anggaran Rumah Tangga

A household budget site for an Indonesian family (Keluarga Santoso, November 2026), built as plain static files: no build step, no network requests, it opens in desktop Chrome and on a phone. Every figure is real and consistent — all pages compute from one data table, and every control works.

- **Dasbor** — monthly overview: income Rp 12.500.000, spending Rp 7.202.000, savings Rp 5.298.000 (42,4% savings rate), budget health, top categories, next bills and closest savings goals.
- **Transaksi** — 34 expenses + 3 income sources for November 2026 with dates, categories and amounts; a working add-transaction form that adds a row and updates every total; category filter and text search.
- **Anggaran** — 8 categories with limits totalling Rp 9.500.000 and progress bars vs actual spending (Belanja Harian Rp 2.340.000 / Rp 3.000.000, Transportasi, Listrik/Air/Internet, Makan di Luar, Hiburan, Kesehatan, Pendidikan, Rumah Tangga).
- **Tagihan** — 8 recurring bills with due dates (total Rp 3.658.000, Rp 2.980.000 unpaid); paid/unpaid toggles that work, plus an add-bill form.
- **Tabungan** — 4 savings goals (Dana Darurat Rp 18.500.000 / Rp 30.000.000, Liburan ke Bali, Kulkas Baru, DP Rumah) with working add-to-goal controls, plus an add-goal form.
- **Laporan** — 6-month income-vs-spending trend chart and a per-category chart, drawn on plain canvas, plus a month-by-month summary table.

Edits persist in the browser (localStorage); nothing is sent anywhere.

## Run it

```sh
node main.ts --serve     # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22+, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## How the numbers add up

Income Rp 12.500.000 − spending Rp 7.202.000 = savings Rp 5.298.000. The 34 expense rows sum per category to exactly the budget bars: Belanja Harian 2.340.000, Transportasi 875.000, Listrik/Air/Internet 812.000, Makan di Luar 640.000, Hiburan 400.000, Kesehatan 520.000, Pendidikan 1.150.000, Rumah Tangga 465.000 — total 7.202.000, and November in the 6-month trend matches the same figure. The figures are a realistic example for an Indonesian household, not real financial data.

## Entry

- Competition: [Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457)
- Referral code: `xmc7n7gx`
- License: MIT
