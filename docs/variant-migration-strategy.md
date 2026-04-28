# Variant Migration Strategy

This project now treats `Book` as the parent product and `BookVariant` as the sellable SKU.

## Safe migration order

1. Deploy schema changes that add `BookVariant`, `BookImage.variantId`, and `discountPercent`.
2. For every existing `Book`, create one default variant:
   - `name = "Mặc định"`
   - `price = Book.price`
   - `stock = Book.stock`
   - `sku = CONCAT("BOOK-", Book.id)`
3. Backfill old records:
   - map `CartItem.bookId` -> matching default `variantId`
   - map `OrderItem.bookId` -> matching default `variantId`
   - map `Wishlist.bookId` -> matching default `variantId`
4. Switch backend APIs to accept and return `variantId`.
5. Switch frontend cart, wishlist, checkout, and order history to use selected variants.
6. After production data is verified, stop relying on legacy `Book.price` and `Book.stock` as the purchase source of truth.

## Notes

- Keep `Book.price` and `Book.stock` temporarily as summary/fallback fields for compatibility.
- `BookAttribute` stays at the product level and is used for the information table on the detail page.
- Reviews can remain attached to `Book` unless you explicitly want reviews per edition/format.

## Backfill SQL sketch

```sql
INSERT INTO BookVariant (bookId, name, sku, price, stock)
SELECT id, 'Mặc định', CONCAT('BOOK-', id), price, stock
FROM Book b
WHERE NOT EXISTS (
  SELECT 1 FROM BookVariant v WHERE v.bookId = b.id
);
```

Run the equivalent updates for `CartItem`, `OrderItem`, and `Wishlist` before removing any legacy columns.
