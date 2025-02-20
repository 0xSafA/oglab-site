import { RadioGroup } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { Fragment, useEffect, useState } from 'react';
import Alert from '@/components/ui/alert';
import CashOnDelivery from '@/components/checkout/payment/cash-on-delivery';
import { useAtom } from 'jotai';
import { paymentSubGatewayAtom } from '@/store/checkout';
import cn from 'classnames';
import { useSettings } from '@/framework/settings';
import { PaymentGateway } from '@/types';
import PaymentOnline from '@/components/checkout/payment/payment-online';
import Image from 'next/image';

interface PaymentSubGateways {
  name: string;
  value: string;
}
interface AvailableMethodInformation {
  name: string;
  value: string;
}
interface AvailableMethodOptionProps {
  availableMethod: AvailableMethodInformation;
  theme?: string;
}

const PaymentSubGridComponent: React.FC<AvailableMethodOptionProps> = ({
  availableMethod: { name, value },
  theme,
}) => {
  return (
    <RadioGroup.Option value={value} key={value}>
      {({ checked }) => (
        <div
          className={cn(
            'relative flex h-full w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-light py-3 text-center',
            checked && '!border-accent bg-light shadow-600',
            {
              '!border-gray-800 bg-light shadow-600': theme === 'bw' && checked,
            }
          )}
        >
          <span className="text-xs font-semibold text-heading">{name}</span>
        </div>
      )}
    </RadioGroup.Option>
  );
};

const PaymentSubGrid: React.FC<{
  theme?: 'bw';
  gateway: string;
  paymentSubGateway: PaymentSubGateways[];
}> = ({ theme, gateway, paymentSubGateway }) => {
  const [subGateway, setSubGateway] = useAtom(paymentSubGatewayAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    if (gateway && gateway === 'PAYMONGO') {
      setSubGateway(subGateway);
    } else {
      setSubGateway('');
    }
  }, [gateway, subGateway]);
  
  return (
    <Fragment>
      {gateway && gateway === 'PAYMONGO' ? (
        <Fragment>
          {errorMessage ? (
            <Alert
              message={t(`common:${errorMessage}`)}
              variant="error"
              closeable={true}
              className="mt-5"
              onClose={() => setErrorMessage(null)}
            />
          ) : null}

          <RadioGroup value={subGateway} onChange={setSubGateway}>
            <RadioGroup.Label className="mb-5 block text-base font-semibold text-heading">
              Select gateway
            </RadioGroup.Label>

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {paymentSubGateway &&
                paymentSubGateway.map((sub, key) => {
                  return (
                    <Fragment key={key}>
                      <PaymentSubGridComponent
                        availableMethod={sub}
                        theme={theme}
                      />
                    </Fragment>
                  );
                })}
            </div>
          </RadioGroup>
        </Fragment>
      ) : (
        ''
      )}
    </Fragment>
  );
};

export default PaymentSubGrid;
