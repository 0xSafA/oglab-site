import FaqLoader from '@/components/ui/loaders/faq-loader';
import Accordion from '@/components/ui/accordion';
import { FAQS } from '@/types';

export const prepareAccordionData = (faqs: FAQS[]) => {
  let faqData = [];
  if (faqs) {
    for (let index = 0; index < faqs?.length; index++) {
      let tempFaqObj = {
        title: '',
        content: '',
        issued_by: '',
        faq_type: '',
      };
      tempFaqObj.title = faqs[index]?.faq_title;
      tempFaqObj.content = faqs[index]?.faq_description;
      tempFaqObj.issued_by = faqs[index]?.issued_by;
      tempFaqObj.faq_type = faqs[index]?.faq_type;
      faqData.push(tempFaqObj);
    }
  }
  return faqData;
};

type FAQProps = {
  isLoading: boolean;
  data: FAQS[];
};

const FAQ = ({ isLoading, data }: FAQProps) => {
  const faqs = prepareAccordionData(data);
  return (
    <>
      {isLoading && !data.length ? (
        <FaqLoader />
      ) : (
        <Accordion items={faqs} translatorNS="faq" />
      )}
    </>
  );
};

export default FAQ;
