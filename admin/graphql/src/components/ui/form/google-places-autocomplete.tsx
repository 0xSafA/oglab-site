import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Loader from '../loader/loader';
import { LocationInput } from '__generated__/__types__';
import { MapPin } from '@/components/icons/map-pin';

const libraries: any = ['places'];

export default function GooglePlacesAutocomplete({
  onChange,
  data,
  disabled,
  icon = false,
}: {
  onChange: any;
  onChangeCurrentLocation?: any;
  data: LocationInput;
  className?: string;
  disabled?: boolean;
  icon?: boolean;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google_map_autocomplete',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!,
    libraries,
  });

  const [autocomplete, setAutocomplete] = React.useState<any>(null);
  //@ts-ignore
  const onLoad = React.useCallback(function callback(autocompleteInstance) {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setAutocomplete(null);
  }, []);

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      return;
    }
    const location: any = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      formattedAddress: place.formatted_address,
    };

    for (const component of place.address_components) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];

      switch (componentType) {
        case 'postal_code': {
          location['zip'] = component.long_name;
          break;
        }

        case 'postal_code_suffix': {
          location['zip'] = `${location?.zip}-${component.long_name}`;
          break;
        }

        case 'state_name':
          location['street_address'] = component.long_name;
          break;

        case 'route':
          location['street_address'] = component.long_name;
          break;

        case 'sublocality_level_1':
          location['street_address'] = component.long_name;
          break;

        case 'locality':
          location['city'] = component.long_name;
          break;

        case 'administrative_area_level_1': {
          location['state'] = component.short_name;
          break;
        }

        case 'country':
          location['country'] = component.long_name;
          break;
      }
    }
    if (onChange) {
      onChange(location);
    }
  };

  useEffect(() => {
    const getLocation = data?.formattedAddress;
    setInputValue(getLocation!);
  }, [data]);

  if (loadError) {
    return <div>{t('common:text-map-cant-load')}</div>;
  }

  return isLoaded ? (
    <div className="relative">
      {icon && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-12 text-gray-400">
          <MapPin className="w-[18px]" />
        </div>
      )}
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        onUnmount={onUnmount}
        fields={[
          'address_components',
          'geometry.location',
          'formatted_address',
        ]}
        types={['address']}
      >
        <input
          type="text"
          placeholder={t('form:placeholder-search-location')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`flex h-12 w-full appearance-none items-center rounded border border-border-base text-sm text-heading transition duration-300 ease-in-out  focus:border-accent focus:outline-none focus:ring-0 ${disabled ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]' : ''
            } ${icon ? 'pe-4 ps-9' : 'px-4'}`}
          disabled={disabled}
        />
      </Autocomplete>
    </div>
  ) : (
    <Loader simple={true} className="w-6 h-6" />
  );
}
