import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";

interface Meta {
  name: string;
  license: string;
  website: string;
  page: number;
  limit: number;
  found: number;
}

export interface Location {
  id: number;
  city: string;
  name: string;
  entity: any;
  country: string;
  sources: any;
  isMobile: boolean;
  isAnalysis: any;
  parameters: Parameter[];
  sensorType: any;
  coordinates: Coordinates;
  lastUpdated: string;
  firstUpdated: string;
  measurements: number;
  bounds: number[];
  manufacturers: Manufacturer[];
}

export interface Parameter {
  id: number;
  unit: string;
  count: number;
  average: number;
  lastValue: number;
  parameter: string;
  displayName: string;
  lastUpdated: string;
  parameterId: number;
  firstUpdated: string;
  manufacturers: Manufacturer[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Manufacturer {
  modelName: string;
  manufacturerName: string;
}

export type LocationsParams = {
  coordinates?: string;
  location?: string;
  page: string;
};

export const useLocations = (params: LocationsParams, disabled: boolean) => {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const controllerRef = useRef(new AbortController());
  const searchParams = useMemo(() => {
    controllerRef.current.abort();
    if (controllerRef.current?.signal.aborted)
      controllerRef.current = new AbortController();
    const parsed = new URLSearchParams();
    for (const key in params) {
      const value = params[key as keyof typeof params];
      if (value) {
        parsed.append(key, value);
      }
    }
    parsed.append("limit", "20");
    parsed.append("offset", "0");
    parsed.append("sort", "desc");
    parsed.append("radius", "25000"); // 25km
    parsed.append("order_by", "lastUpdated");
    parsed.append("dump_raw", "false");
    parsed.append('timestamp', `${timestamp}`);
    return parsed;
  }, [params, timestamp]);

  const fetcher = async (url: string) => {
    const signal = controllerRef.current?.signal;
    const response = await fetch(url, {
      signal,
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  };
  const disableFetch =
    disabled || (params.location?.length! > 0 && params.location?.length! < 4);

  const { data, error, mutate, isLoading } = useSWR<{
    meta: Meta;
    results: Location[];
  }>(
    !disableFetch
      ? `https://api.openaq.org/v2/locations?${searchParams.toString()}`
      : null,
    fetcher,
    {
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (error.status === 404) return;
       // if (retryCount >= 3) return;
        setTimestamp(Date.now());
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    locations: data && "results" in data ? data : null,
    lastPage: data?.meta?.found && data?.meta?.limit <= data?.meta?.found
      ? Math.round(data?.meta?.found / data?.meta?.limit)
      : 1,
    nextPage: data?.meta?.page ? data?.meta?.page + 1 : 0,
    isLoading,
    isError: error,
    mutateLocations: mutate,
  };
};

/* the location parameter don't make partial match and is case sensitive,
 so I get some near locations to show as suggestions */
export const useLocationsSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    const fetcher = async (page: number) => {
      try {
        const promise = fetch(
          `https://api.openaq.org/v2/locations?limit=1000&page=${page}&offset=0&sort=desc&radius=25000&order_by=lastUpdated&dump_raw=false`
        );
        const response = await promise;
        const data = await response.json();
        if (!data.results) return 0;
        setSuggestions((prevState) => {
          const unique: Set<string> = new Set([
            ...prevState,
            ...data.results.map((location: Location) => location.name),
          ]);
          return [...Array.from(unique)];
        });
        return Math.round(data.meta.found / data.meta.limit);
      } catch (error) {
        console.error(error);
        return 0;
      }
    };
    const resolver = async () => {
      const pages = await fetcher(1);
      const promises: any[] = [];
      const limit = pages > 4 ? 4 : pages; // an internal limit
      let page = 2;
      while (page <= limit) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // avoid rate limit
        await fetcher(page);
        page++;
      }
    };
    resolver();
  }, []);

  return suggestions;
};
