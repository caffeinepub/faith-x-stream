import { useGetAllBrands } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function NetworksPage() {
  const { data: brands, isLoading } = useGetAllBrands();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-8 w-8 text-[oklch(0.45_0.2_0)]" />
        <h1 className="text-3xl font-bold">Networks & Brands</h1>
      </div>

      {brands && brands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: brand.id } })}
              className="group relative cursor-pointer rounded-lg overflow-hidden bg-card border border-border hover:border-[oklch(0.45_0.2_0)] transition-all"
            >
              <div className="aspect-video relative bg-gradient-to-br from-[oklch(0.25_0.08_0)] to-[oklch(0.15_0.05_0)] flex items-center justify-center">
                {brand.logo ? (
                  <img
                    src={brand.logo.getDirectURL()}
                    alt={brand.name}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <Building2 className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{brand.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {brand.channels.length} channels
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No networks available</p>
        </div>
      )}
    </div>
  );
}
