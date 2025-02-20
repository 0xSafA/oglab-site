
import { RefundPolicyTarget as RefundPolicyEnum, RefundPolicyStatus } from '__generated__/__types__';


export interface IRefundPolicyEnumerable {
    name: string;
    value: string;
};

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
    return [
        {
            id: 1,
            title: `Explore the captivating imagination of a rising literary talent, ${name}.`,
        },
        {
            id: 2,
            title: `Immerse yourself in the thought-provoking world crafted by visionary author ${name}.`,
        },
        {
            id: 3,
            title: `Discover the compelling storytelling prowess of ${name} through their debut work.`,
        },
        {
            id: 4,
            title: `Experience the unique voice and perspective of ${name} in their literary creations.`,
        },
        {
            id: 5,
            title: `Dive into the pages of ${name}'s writing and embark on a literary journey like no other.`,
        },
        {
            id: 6,
            title: `Uncover the literary genius of ${name}, captivating readers with their brilliant narratives.`,
        },
        {
            id: 7,
            title: `Indulge in the lyrical prose and evocative storytelling of acclaimed author ${name}.`,
        },
        {
            id: 8,
            title: `Get ready to be enchanted by the imaginative narratives and vivid characters brought to life by ${name}.`,
        },
        {
            id: 9,
            title: `Be captivated by the powerful storytelling and insightful observations of emerging author ${name}.`,
        },
        {
            id: 10,
            title: `Enter a world of literary brilliance with ${name}, where imagination knows no bounds.`,
        },
    ];
};

export const RefundPolicyType: Array<IRefundPolicyEnumerable> = Object.keys(RefundPolicyEnum).map((target: string) => (
    { name: target.toLocaleUpperCase(), value: target })
);
export const RefundPolicyStatusType: Array<IRefundPolicyEnumerable> = Object.keys(RefundPolicyStatus).map((target: string) => (
    { name: target, value: target.toLocaleLowerCase() })
);