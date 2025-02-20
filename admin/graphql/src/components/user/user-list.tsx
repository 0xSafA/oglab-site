import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { useMeQuery } from '@/graphql/me.graphql';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  UserPaginator,
  SortOrder,
  QueryUsersOrderByColumn,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import Avatar from '../common/avatar';

type IProps = {
  customers: UserPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const UsersList = ({ customers, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = customers!;
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

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

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 150,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc && column === QueryUsersOrderByColumn.Name
          }
          isActive={column === QueryUsersOrderByColumn.Name}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick(QueryUsersOrderByColumn.Name),
      render: (
        name: string,
        { profile, email }: { profile: any; email: string }
      ) => (
        <div className="flex items-center">
          <Avatar name={name} src={profile?.avatar?.thumbnail} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {name}
            <span className="text-[13px] font-normal text-gray-500/80">
              {email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      align: alignLeft,
      width: 300,
      render: (permissions: any) => {
        return (
          <div className="flex flex-wrap gap-1.5 whitespace-nowrap">
            {permissions?.map(
              ({ name, index }: { name: string; index: number }) => (
                <span
                  key={index}
                  className="rounded bg-gray-200/50 px-2.5 py-1"
                >
                  {name}
                </span>
              )
            )}
          </div>
        );
      },
    },
    {
      title: t('table:table-item-available_wallet_points'),
      dataIndex: ['wallet', 'available_points'],
      key: 'available_wallet_points',
      align: 'center',
      width: 150,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryUsersOrderByColumn.IsActive
          }
          isActive={column === QueryUsersOrderByColumn.IsActive}
        />
      ),
      width: 150,
      className: 'cursor-pointer',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      onHeaderCell: () => onHeaderClick(QueryUsersOrderByColumn.IsActive),
      render: (is_active: boolean) => (
        <Badge
          textKey={
            is_active ? t('common:text-active') : t('common:text-inactive')
          }
          color={
            is_active
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(id: string, { is_active }: any) {
        const { data: currentUser } = useMeQuery();
        return (
          <>
            {currentUser?.me?.id !== id && (
              <ActionButtons
                id={id}
                userStatus={true}
                isUserActive={is_active}
                showAddWalletPoints={true}
                showMakeAdminButton={true}
              />
            )}
          </>
        );
      },
    },
  ];

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
          data={data as any}
          rowKey="id"
          scroll={{ x: 1000 }}
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

export default UsersList;
