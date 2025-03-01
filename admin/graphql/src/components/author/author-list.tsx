import LanguageSwitcher from '@/components/ui/lang-action/action';
import Pagination from '@/components/ui/pagination';
import { AlignType, Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import Avatar from '@/components/common/avatar';
import TitleWithSort from '@/components/ui/title-with-sort';
import { useUpdateAuthorMutation } from '@/graphql/authors.graphql';
import { Switch } from '@headlessui/react';
import {
  Attachment,
  Author,
  AuthorPaginator,
  QueryAuthorsOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { toast } from 'react-toastify';
import { NoDataFound } from '@/components/icons/no-data-found';

type IProps = {
  authors: AuthorPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
  is_admin?: boolean;
};

const AuthorList = ({ authors, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = authors!;
  const { t } = useTranslation();
  const router = useRouter();

  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          orderBy: [
            {
              column: value,
              order: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
            },
          ],
        });
      }, 500),
    [order]
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  let columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            order === SortOrder.Asc && column === QueryAuthorsOrderByColumn.Id
          }
          isActive={column === QueryAuthorsOrderByColumn.Id}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryAuthorsOrderByColumn.Id),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc && column === QueryAuthorsOrderByColumn.Name
          }
          isActive={column === QueryAuthorsOrderByColumn.Name}
        />
      ),
      dataIndex: 'name',
      className: 'cursor-pointer',
      key: 'name',
      align: 'left',
      width: 220,
      onHeaderCell: () => onHeaderClick(QueryAuthorsOrderByColumn.Name),
      render: (name: string, { image }: { image: Attachment }) => (
        <div className="flex items-center">
          <Avatar name={name} src={image?.thumbnail as string} />
          <span className="whitespace-nowrap font-medium ms-2.5">{name}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'products_count',
      key: 'products_count',
      width: 160,
      align: 'center' as AlignType,
    },
    {
      title: t('table:table-item-approval-action'),
      dataIndex: 'is_approved',
      key: 'approve',
      align: 'center' as AlignType,
      width: 160,
      render: function Render(is_approved: boolean, record: any) {
        const [updateAuthor] = useUpdateAuthorMutation({
          onCompleted: () => {
            toast.success(t('common:successfully-updated'));
          }
        });

        function handleOnClick() {
          updateAuthor({
            variables: {
              input: {
                language: router.locale,
                id: record?.id,
                name: record?.name,
                is_approved: !is_approved,
                slug: record?.slug,
              },
            },
          });
        }

        return (
          <>
            <Switch
              checked={is_approved}
              onChange={handleOnClick}
              className={`${
                is_approved ? 'bg-accent' : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
              dir="ltr"
            >
              <span className="sr-only">Enable</span>
              <span
                className={`${
                  is_approved ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
              />
            </Switch>
          </>
        );
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right' as AlignType,
      width: 120,
      render: (slug: string, record: Author) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_AUTHOR"
          routes={Routes?.author}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter(
      (col) => col?.key !== 'approve' && col?.key !== 'actions'
    );
  }

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={data}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {!!paginatorInfo.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default AuthorList;
