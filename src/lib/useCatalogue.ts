import { applyCatalogueFoundation } from './foundation';
import { useEffect, useState } from 'react';
import { loadCatalogue, snapshotCatalogue, type RemoteCatalogue } from './remoteCatalogue';

export function useCatalogue(): RemoteCatalogue & { loading: boolean } {
  const [catalogue, setCatalogue] = useState(snapshotCatalogue);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    loadCatalogue().then((value) => {
      if (active) {
        applyCatalogueFoundation(value.hueScales);
        setCatalogue(value);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  return { ...catalogue, loading };
}
