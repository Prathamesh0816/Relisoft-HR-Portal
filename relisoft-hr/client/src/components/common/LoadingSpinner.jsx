import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={32} className="text-relisoft-600 animate-spin" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};

export default LoadingSpinner;
