import {camelCase,  startCase} from 'lodash';

type EventOptions = {
  label: string;
  value: string;
};

type EventOptionsType = 'admin' | 'vendor' | 'customer';

/**
 * Format form data before shift to API
 *
 * @param data
 */
export function formatEventOptions(data: EventOptions[]) {
  const formattedOptions = {
    admin: {},
    vendor: {},
    customer: {},
  };

  for (const singleData of data) {
    const value = singleData?.value;
    const search = value?.match(/admin|vendor|customer/);

    if (search) {
      const replaceValue = `^${search[0]}-`;
      const regex = new RegExp(replaceValue, 'g');
      formattedOptions[search[0] as EventOptionsType] = {
        ...formattedOptions[search[0] as EventOptionsType],
        [value.replace(regex, '')]: true,
      };
    }
  }

  return formattedOptions;
}

/**
 * Format data from API to form data
 * @param Event
 */
export function formatEventAPIData(Event: any) {
  const formattedEvent = Object.keys(Event)
    .map((options) => {
      return Object.keys(Event[options])
        .filter((optionsValue) => Event[options][optionsValue] === true)
      .map((optionsValue) => {
        return {
          value: `${options}-${camelCase(optionsValue)}`,
          label: `${startCase(optionsValue)}`,
        };
      });
    })
    .flat();

  return formattedEvent ?? {};
}



type NotificationOption = {
  value: string;
  label: string;
};

type FormattedNotifications = {
  [key: string]: boolean;
};

export function formatNotificationOptions (options: NotificationOption[]): FormattedNotifications {
  const formattedObject: FormattedNotifications = {};

  options.forEach(({ value }) => {
    const key = value.split('-')[1];
    formattedObject[key] = true;
  });

  return formattedObject;
};

