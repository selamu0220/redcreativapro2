"use client";

import { algoliasearch } from "algoliasearch";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  Configure,
  useInstantSearch,
} from "react-instantsearch";
import Link from "next/link";
import { BookOpen, ArrowRight, Search as SearchIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const SEARCH_ONLY_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || "";

const searchClient = (APP_ID && SEARCH_ONLY_KEY)
  ? algoliasearch(APP_ID, SEARCH_ONLY_KEY)
  : {
    search: () => Promise.resolve({ results: [] }),
  } as any;

function NoResultsBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const { results } = useInstantSearch();

  if (!results.__isArtificial && results.nbHits === 0) {
    return (
      <>
        {fallback}
        <div hidden>{children}</div>
      </>
    );
  }

  return <>{children}</>;
}

function CustomSearchBox() {
  return (
    <div className="relative max-w-xl mx-auto mb-12">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <SearchBox
        placeholder="Buscar artículos con IA..."
        classNames={{
          root: "relative",
          form: "relative",
          input: "flex h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          submit: "hidden",
          reset: "hidden",
          loadingIndicator: "hidden",
        }}
      />
    </div>
  );
}

function Hit({ hit }: { hit: any }) {
  return (
    <Link href={`/blog/${hit.slug}`} className="group">
      <Card className="h-full overflow-hidden border-border bg-card transition-all hover:border-primary/50">
        <div className="relative h-48 overflow-hidden">
          {hit.image ? (
            <img
              src={hit.image}
              alt={hit.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge className="bg-background/80 backdrop-blur text-foreground border-none">
              {hit.category || hit.tags?.[0] || "Blog"}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{hit.publishedAt ? new Date(hit.publishedAt).toLocaleDateString() : ""}</span>
          </div>
          <CardTitle className="text-xl group-hover:underline underline-offset-4 decoration-1 leading-tight text-foreground">
            <Highlight attribute="title" hit={hit} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            <Highlight attribute="excerpt" hit={hit} />
          </p>
          <div className="flex items-center text-sm font-medium text-primary">
            Leer artículo <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AlgoliaSearch() {
  if (!APP_ID || !SEARCH_ONLY_KEY) {
    return null;
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="blog_posts">
      <Configure hitsPerPage={9} />
      <CustomSearchBox />

      <NoResultsBoundary
        fallback={
          <div className="text-center py-24 border rounded-xl border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron artículos</h3>
            <p className="text-muted-foreground">Prueba con otros términos de búsqueda.</p>
          </div>
        }
      >
        <Hits
          hitComponent={Hit}
          classNames={{
            list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24",
          }}
        />
      </NoResultsBoundary>
    </InstantSearch>
  );
}
