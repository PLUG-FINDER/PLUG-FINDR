// TypeScript declarations for Google Maps API
declare namespace google {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
    }

    class LatLngBounds {
      constructor(sw: LatLng, ne: LatLng);
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        getPlace(): PlaceResult;
        addListener(event: string, handler: () => void): void;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds;
        componentRestrictions?: { country: string | string[] };
        types?: string[];
        fields?: string[];
      }

      interface PlaceResult {
        name?: string;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
        };
        place_id?: string;
      }
    }

    namespace geometry {
      namespace spherical {
        function computeDistanceBetween(from: LatLng, to: LatLng): number;
      }
    }

    namespace event {
      function clearInstanceListeners(instance: any): void;
    }
  }
}

declare interface Window {
  google: typeof google;
}

