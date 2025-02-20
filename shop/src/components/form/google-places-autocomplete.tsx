import { useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { GoogleMapLocation } from '@/types';
import { useTranslation } from 'next-i18next';
import { SpinnerLoader } from '@/components/ui/loaders/spinner/spinner';
import { MapPin } from '@/components/icons/map-pin';
import useLocation, { locationAtom } from '@/lib/use-location';
import CurrentLocation from '../icons/current-location';
import { useAtom } from 'jotai';

export default function GooglePlacesAutocomplete({
  register,
  onChange,
  onChangeCurrentLocation,
  data,
  disabled = false,
}: {
  register: any;
  onChange?: () => void;
  onChangeCurrentLocation?: () => void;
  data?: GoogleMapLocation;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [
    onLoad,
    onUnmount,
    onPlaceChanged,
    getCurrentLocation,
    isLoaded,
    loadError,
  ] = useLocation({ onChange, onChangeCurrentLocation, setInputValue });
  const [location] = useAtom(locationAtom);

  useEffect(() => {
    const getLocation = data?.formattedAddress;
    setInputValue(getLocation!);
  }, [data]);

  if (loadError) {
    return <div>{t('common:text-map-cant-load')}</div>;
  }
  return isLoaded ? (
    <div className="relative">
      {/* <div className="absolute top-0 left-0 flex h-12 w-10 items-center justify-center text-gray-400">
        <MapPin className="w-[18px]" />
      </div> */}
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
          {...register('location')}
          placeholder={t('common:placeholder-search-location')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`line-clamp-1 flex h-12 w-full appearance-none items-center rounded border border-border-base p-4 pr-9 text-sm font-medium text-heading transition duration-300 ease-in-out invalid:border-red-500 focus:border-accent focus:outline-0 focus:ring-0 ${
            disabled ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]' : ''
          }`}
          disabled={disabled}
        />
      </Autocomplete>
      <div className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center text-accent">
        <CurrentLocation
          className="h-5 w-5 cursor-pointer hover:text-accent"
          onClick={() => {
            getCurrentLocation();
            setInputValue(location?.formattedAddress!);
          }}
        />
      </div>
    </div>
  ) : (
    <SpinnerLoader />
  );
}
