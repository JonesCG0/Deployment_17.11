# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IS 455 (Chapter 17) assignment — build and deploy an end-to-end ML pipeline with a web app. Two deliverables:
- **Part 1**: Web app backed by `shop.db`, deployed to Vercel
- **Part 2**: CRISP-DM Jupyter notebook predicting `is_fraud` in the `orders` table

## Database: `shop.db` (SQLite)

Central data source for both the web app and ML pipeline.

| Table | Rows | Key Columns |
|---|---|---|
| `customers` | 250 | `customer_id`, `customer_segment`, `loyalty_tier` |
| `products` | 100 | `product_id`, `category`, `price`, `cost` |
| `orders` | 5,000 | `customer_id`, `payment_method`, `device_type`, `ip_country`, `risk_score`, **`is_fraud`** (target) |
| `order_items` | 15,022 | `order_id`, `product_id`, `quantity`, `unit_price` |
| `shipments` | 5,000 | `order_id`, `carrier`, `promised_days`, `actual_days`, **`late_delivery`** |
| `product_reviews` | 3,000 | `customer_id`, `product_id`, `rating` |

**ML target**: `is_fraud` in `orders` — binary (6.4% fraud rate, class imbalance applies).
**Warehouse feature**: `late_delivery` in `shipments` — used for the priority queue.

## Part 1: Web App

### Required Pages
1. **Select Customer** — list/search customers, no auth
2. **Customer Dashboard** — order summaries for selected customer
3. **New Order** — place and persist an order to `shop.db`
4. **Order History** — past orders for selected customer
5. **Warehouse / Late Delivery Queue** — top 50 orders by predicted late-delivery probability; includes a **Run Scoring** button that triggers ML inference and refreshes the list

### Stack Options
Any of: Next.js, FastAPI + React, or ASP.NET. Deploy to Vercel (or equivalent).

## Part 2: ML Notebook

Full CRISP-DM pipeline in a `.ipynb` file:
- Load data from `shop.db` via `sqlite3` or `sqlalchemy`
- Feature engineering from `orders`, `customers`, `shipments`, `order_items`
- Handle class imbalance (318 fraud / 4,682 non-fraud)
- Classification models + ensemble methods
- Model evaluation (precision/recall/F1/AUC — accuracy alone is misleading given imbalance)
- Serialize final model (e.g., `joblib`/`pickle`) for integration with the web app's Run Scoring endpoint
