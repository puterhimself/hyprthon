// "use client";

import Link from "next/link";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { CollectionCard } from "@/components/collection-card";
import { db } from "@/server/db";
import { collections } from "@/server/db/schema";

export default async function HomePage() {
  // Fetch collections from database
  const allCollections = await db
    .select()
    .from(collections)
    .orderBy(desc(collections.createdAt))
    .limit(12);

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NFT Collections</h1>
          <p className="text-muted-foreground">
            Discover and mint from the latest NFT collections
          </p>
        </div>
        <Button asChild>
          <Link href="/create">Create Collection</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>

      {allCollections.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold">No collections yet</h3>
          <p className="text-muted-foreground">
            Be the first to create a collection!
          </p>
          <Button asChild className="mt-4">
            <Link href="/create">Create Collection</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
