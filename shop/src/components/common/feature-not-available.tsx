import NotFound from '@/components/ui/not-found';

interface FeatureNotAvailableProps {
  title?: string;
  className?: string;
}

export const FeatureNotAvailable = ({
  title = 'Sorry this feature is not available! 🥹',
  className,
}: FeatureNotAvailableProps) => {
  return <NotFound text={title} className={className} />;
};
