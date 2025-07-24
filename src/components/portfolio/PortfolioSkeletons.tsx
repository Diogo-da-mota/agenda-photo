import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de skeleton para cards conforme auditoria
export const PortfolioCardSkeleton = () => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-48 w-full rounded-md mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex gap-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </CardContent>
  </Card>
);

// Grid de skeletons conforme auditoria
export const PortfolioSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <PortfolioCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton para galeria masonry
export const GaleriaSkeletonGrid = ({ count = 12 }: { count?: number }) => (
  <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="break-inside-avoid">
        <Skeleton 
          className="w-full rounded-t-lg" 
          style={{ height: `${200 + (i % 3) * 50}px` }} 
        />
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
); 