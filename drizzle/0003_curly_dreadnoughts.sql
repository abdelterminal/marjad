CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "products_published_created_idx" ON "products" USING btree ("is_published","created_at");--> statement-breakpoint
CREATE INDEX "products_published_price_idx" ON "products" USING btree ("is_published","price");--> statement-breakpoint
CREATE INDEX "products_category_published_created_idx" ON "products" USING btree ("category_id","is_published","created_at");