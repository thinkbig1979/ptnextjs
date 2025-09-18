import { Metadata } from 'next';
import { YachtCard } from '@/components/yacht-profiles/YachtCard';
import tinaCMSDataService from '@/lib/tinacms-data-service';

export const metadata: Metadata = {
  title: 'Yacht Profiles | Marine Technology Platform',
  description: 'Explore detailed yacht profiles with timeline visualization, supplier information, and sustainability metrics.',
};

export default async function YachtsPage() {
  const yachts = await tinaCMSDataService.getAllYachts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold mb-4">
          Yacht Profiles
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover detailed yacht profiles showcasing construction timelines, supplier networks,
          sustainability metrics, and technological innovations in modern yacht building.
        </p>
      </div>

      {yachts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {yachts.map((yacht) => (
            <YachtCard key={yacht.id} yacht={yacht} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No yacht profiles available yet. Check back soon for detailed yacht showcases.
          </p>
        </div>
      )}
    </div>
  );
}