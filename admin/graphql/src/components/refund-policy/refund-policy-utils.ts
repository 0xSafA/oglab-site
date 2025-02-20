import {
  RefundPolicyTarget as RefundPolicyEnum,
  RefundPolicyStatus,
} from '__generated__/__types__';

export interface IRefundPolicyEnumerable {
  name: string;
  value: string;
}

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a description about Refund Policies.`,
    },
    {
      id: 2,
      title: `Write a description about Your Refund Process Guidelines in store.`,
    },
    {
      id: 3,
      title: `Write a description about a Clear Refund Procedure.`,
    },
    {
      id: 4,
      title: `Write a description about Product Return Policy.`,
    },
    {
      id: 5,
      title: `Write a description about How Partial Refunds Work.`,
    },
    {
      id: 6,
      title: `Write a description about Refund Terms for Digital Products.`,
    },
    {
      id: 7,
      title: `Write a description about Non-Refundable Items.`,
    },
    {
      id: 8,
      title: `Write a description about Cancellation and Refund Policy.`,
    },
    {
      id: 9,
      title: `Write a description about digital product Refund Guidelines.`,
    },
    {
      id: 10,
      title: `Write a description about Refund Contact Information details.`,
    },
  ];
};

export const RefundPolicyType: Array<IRefundPolicyEnumerable> = Object.keys(
  RefundPolicyEnum
).map((target: string) => ({
  name: target.toLocaleUpperCase(),
  value: target,
}));
export const RefundPolicyStatusType: Array<IRefundPolicyEnumerable> =
  Object.keys(RefundPolicyStatus).map((target: string) => ({
    name: target,
    value: target.toLocaleLowerCase(),
  }));
