import { UploadIcon } from '@/components/icons/upload-icon';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadMutation } from '@/graphql/upload.graphql';
import { CloseIcon } from '@/components/icons/close-icon';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import isObject from 'lodash/isObject';
import { Attachment } from '__generated__/__types__';
import { zipPlaceholder } from '@/utils/placeholders';
import Image from 'next/image';
import { ACCEPTED_FILE_TYPES } from '@/utils/constants';
import cn from 'classnames';

const getPreviewImage = (value: any) => {
  if (Array.isArray(value)) {
    return value.map(({ __typename, ...u }: any) => u);
  }
  if (isObject(value)) {
    const { __typename, ...rest }: any = value;
    return [rest];
  }
  return [];
};
export default function Uploader({
  onChange,
  value,
  multiple,
  acceptFile,
  helperText,
  maxSize,
  disabled,
}: any) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<Attachment[]>(getPreviewImage(value));
  const [error, setError] = useState<string | null>(null);
  const [upload, { loading }] = useUploadMutation();
  const { getRootProps, getInputProps } = useDropzone({
    ...(!acceptFile
      ? {
          accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
          },
        }
      : { ...ACCEPTED_FILE_TYPES }),
    multiple,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        const { data } = await upload({
          variables: {
            attachment: acceptedFiles, // it will be an array of uploaded attachments
          },
        });
        console.log(acceptedFiles);
        let dataAfterRemoveTypename =
          data?.upload?.map(({ __typename, ...u }: any) => u) ?? [];
        if (multiple) {
          dataAfterRemoveTypename = [...files, ...dataAfterRemoveTypename];
        } else {
          dataAfterRemoveTypename = dataAfterRemoveTypename?.[0];
        }
        setFiles(
          Array.isArray(dataAfterRemoveTypename)
            ? dataAfterRemoveTypename
            : [dataAfterRemoveTypename],
        );
        if (onChange) {
          onChange(dataAfterRemoveTypename);
        }
      }
    },
    maxSize: maxSize,

    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file?.errors?.forEach((error) => {
          if (error?.code === 'file-too-large') {
            setError(t('error-file-too-large'));
          } else if (error?.code === 'file-invalid-type') {
            setError(t('error-invalid-file-type'));
          }
        });
      });
    },
  });

  const handleDelete = (image: string) => {
    // @ts-ignore
    const images = files.filter((file) => file.thumbnail !== image);

    setFiles(images);
    if (onChange) {
      onChange(images);
    }
  };
  const thumbs = files?.map((file: any, idx) => {
    const imgTypes = [
      'tif',
      'tiff',
      'bmp',
      'jpg',
      'jpeg',
      'gif',
      'png',
      'eps',
      'raw',
    ];
    if (file.id) {
      const splitArray = file?.original?.split('/');
      let fileSplitName = splitArray[splitArray?.length - 1]?.split('.'); // it will create an array of words of filename

      const fileType = fileSplitName.pop(); // it will pop the last item from the fileSplitName arr which is the file ext
      const filename = fileSplitName.join('.'); // it will join the array with dot, which restore the original filename
      const isImage = file?.thumbnail && imgTypes.includes(fileType); // check if the original filename has the img ext

      return (
        <div
          className={cn(
            'relative mt-2 inline-flex flex-col overflow-hidden rounded me-2',
            isImage ? 'border border-border-200' : '',
            disabled ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]' : '',
          )}
          key={idx}
        >
          {/* {file?.thumbnail && isImage ? ( */}
          {isImage ? (
            <figure className="relative h-16 w-28">
              <Image
                src={file.thumbnail}
                alt={filename}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-cover"
              />
            </figure>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 min-w-0 items-center justify-center overflow-hidden">
                <Image
                  src={zipPlaceholder}
                  width={56}
                  height={56}
                  alt={filename}
                />
              </div>
              <p className="flex cursor-default items-baseline p-1 text-xs text-body">
                <span
                  className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                  title={`${filename}.${fileType}`}
                >
                  {filename}
                </span>
                .{fileType}
              </p>
            </div>
            // <>
            //   {fileType}-{filename}
            // </>
          )}
          {!disabled ? (
            <button
              className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-light shadow-xl outline-none end-1"
              onClick={() => handleDelete(file.thumbnail)}
            >
              <CloseIcon width={10} height={10} />
            </button>
          ) : (
            ''
          )}
        </div>
      );
    }
  });

  useEffect(
    () => () => {
      // Reset error after upload new file
      setError(null);

      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file: any) => URL.revokeObjectURL(file.thumbnail));
    },
    [files],
  );

  return (
    <section className="upload">
      <div
        {...getRootProps({
          className: cn(
            'border-dashed border-2 h-36 rounded flex flex-col justify-center items-center focus:outline-none',
            disabled
              ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]'
              : 'border-border-base cursor-pointer focus:border-accent-400',
          ),
        })}
      >
        {!disabled ? <input {...getInputProps()} /> : ''}
        <UploadIcon className="text-muted-light" />
        <p className="mt-4 text-center text-sm text-body">
          {helperText ? (
            <span className="font-semibold text-gray-500">{helperText}</span>
          ) : (
            <>
              <span className="font-semibold text-accent">
                {t('text-upload-highlight')}
              </span>{' '}
              {t('text-upload-message')} <br />
              <span className="text-xs text-body">{t('text-img-format')}</span>
            </>
          )}
        </p>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 text-body">
            {error}
          </p>
        )}
      </div>

      {(!!thumbs.length || loading) && (
        <aside className="mt-2 flex flex-wrap">
          {!!thumbs.length && thumbs}
          {loading && (
            <div className="mt-2 flex h-16 items-center ms-2">
              <Loader simple={true} className="h-6 w-6" />
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
