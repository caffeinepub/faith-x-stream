import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Globe, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useGetAllBrands } from '../hooks/useQueries';

export default function NetworksPage() {
  const navigate = useNavigate();
  const { data: brands = [], isLoading } = useGetAllBrands();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Globe size={28} className="text-[oklch(0.55_0.24_25)]" />
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-wide">Networks & Brands</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/2] rounded-xl" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Globe size={48} className="text-[oklch(0.30_0.04_15)] mb-4" />
            <p className="text-lg font-semibold text-[oklch(0.60_0.01_90)]">No networks yet</p>
            <p className="text-sm text-[oklch(0.45_0.01_90)] mt-1">Networks and brands will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map((brand) => {
              const logoUrl = brand.logo?.getDirectURL?.() || '';
              const contentCount =
                brand.assignedFilms.length +
                brand.assignedSeries.length +
                brand.assignedClips.length;

              return (
                <button
                  key={brand.id}
                  onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: brand.id } })}
                  className="group relative aspect-[3/2] rounded-xl overflow-hidden bg-[oklch(0.12_0.02_15)] border border-[oklch(0.20_0.025_15)] hover:border-[oklch(0.55_0.24_25/0.6)] transition-all duration-250 hover:shadow-red-glow hover:-translate-y-1"
                >
                  {/* Background */}
                  {logoUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-[oklch(0.10_0.018_15)]">
                      <img
                        src={logoUrl}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain brand-logo-hover"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[oklch(0.18_0.04_15)] to-[oklch(0.10_0.018_15)]">
                      <span className="font-display text-2xl font-bold text-white uppercase tracking-wide text-center px-3 leading-tight">
                        {brand.name}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[oklch(0.06_0.012_15/0)] group-hover:bg-[oklch(0.06_0.012_15/0.5)] transition-all duration-250" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[oklch(0.06_0.012_15/0.95)] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-250">
                    <p className="text-sm font-bold text-white truncate">{brand.name}</p>
                    {contentCount > 0 && (
                      <p className="text-xs text-[oklch(0.65_0.01_90)] mt-0.5">
                        {contentCount} title{contentCount !== 1 ? 's' : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-[oklch(0.55_0.24_25)] font-semibold">
                      Browse <ArrowRight size={11} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
