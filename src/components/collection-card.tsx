import Image from "next/image";
import Link from "next/link";
import { formatEther } from "viem";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { collections } from "@/server/db/schema";

interface CollectionCardProps {
  collection: typeof collections.$inferSelect;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collection/${collection.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Banner Image */}
        <div className="relative w-full h-32">
          {collection.bannerUrl ? (
            <Image
              src={collection.bannerUrl}
              alt={`${collection.name} banner`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>

        {/* Collection Logo */}
        <div className="relative -mt-10 ml-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-4 border-background">
            {collection.imageUrl ? (
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        </div>

        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">{collection.name}</h3>
              <p className="text-sm text-muted-foreground">{collection.ticker}</p>
            </div>
            <Badge variant="secondary">
              {formatEther(BigInt(collection.price))} ETH
            </Badge>
          </div>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                {collection.mintedCount}
              </span>{" "}
              / {collection.totalSupply} minted
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/50">
          <div className="flex gap-4 text-sm text-muted-foreground">
            {collection.twitter && (
              <Link
                href={`https://twitter.com/${collection.twitter}`}
                className="hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Twitter
              </Link>
            )}
            {collection.discord && (
              <Link
                href={collection.discord}
                className="hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Discord
              </Link>
            )}
            {collection.website && (
              <Link
                href={collection.website}
                className="hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 