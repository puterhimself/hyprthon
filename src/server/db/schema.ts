// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { 
  index, 
  int, 
  sqliteTableCreator, 
  text,
  real,
} from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `hypr_${name}`);

export const users = createTable(
  "user",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    address: text("address").notNull().unique(), // Wallet address
    username: text("username", { length: 100 }),
    avatar: text("avatar_url"),
    bio: text("bio"),
    twitter: text("twitter_handle"),
    discord: text("discord_handle"),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    addressIndex: index("address_idx").on(table.address),
    usernameIndex: index("username_idx").on(table.username),
  })
);

export const collections = createTable(
  "collection",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    ticker: text("ticker", { length: 10 }).notNull(),
    description: text("description"),
    contractAddress: text("contract_address").notNull().unique(),
    network: text("network").notNull(), // e.g., "solana", "ethereum"
    creatorId: int("creator_id").notNull().references(() => users.id),
    
    // Metadata
    symbol: text("symbol"),
    imageUrl: text("image_url"),
    bannerUrl: text("banner_url"),
    website: text("website"),
    twitter: text("twitter"),
    discord: text("discord"),
    
    // Collection Stats
    totalSupply: int("total_supply").notNull(),
    mintedCount: int("minted_count").default(0),
    price: real("price").notNull(), // in SOL/ETH
    royaltyPercentage: real("royalty_percentage"),
    
    // Dates
    mintStartDate: int("mint_start_date", { mode: "timestamp" }),
    mintEndDate: int("mint_end_date", { mode: "timestamp" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    nameIndex: index("name_idx").on(table.name),
    tickerIndex: index("ticker_idx").on(table.ticker),
    contractIndex: index("contract_idx").on(table.contractAddress),
    creatorIndex: index("creator_idx").on(table.creatorId),
  })
);
