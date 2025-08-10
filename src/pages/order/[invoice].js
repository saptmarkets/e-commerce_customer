import { PDFDownloadLink } from "@react-pdf/renderer";
import { useRef } from "react";
import { IoCloudDownloadOutline, IoPrintOutline } from "react-icons/io5";
import ReactToPrint from "react-to-print";
import { useQuery } from "@tanstack/react-query";

//internal import

import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Invoice from "@components/invoice/Invoice";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InvoiceForDownload from "@components/invoice/InvoiceForDownload";
import CancelOrderButton from "@components/order/CancelOrderButton";
import EditOrderButton from "@components/order/EditOrderButton";

const Order = ({ params }) => {
  const printRef = useRef();
  const orderInvoice = params.invoice;

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["order", orderInvoice],
    queryFn: async () => await OrderServices.getOrderByInvoice(orderInvoice),
    enabled: !!orderInvoice,
    refetchInterval: (latestData) => {
      // Poll every 30s only if order is not delivered or cancelled (reduced frequency)
      if (!latestData) return 30000;
      return ["Delivered", "Cancel", "Cancelled"].includes(latestData.status) ? false : 30000;
    },
  });

  const { showingTranslateValue, getNumberTwo, currency, lang } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  if (isLoading) {
    return (
      <Layout title="Order Details" description="Order details page">
        <div className="max-w-screen-2xl mx-auto">
          <Loading loading={isLoading} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Order Details" description="Order details page">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Order Not Found
              </h2>
              <p className="text-gray-600">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Invoice" description="order confirmation page">
      <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-10">
        <div className="bg-white rounded-lg shadow-sm">
          <Invoice
            data={data}
            printRef={printRef}
            currency={currency}
            globalSetting={globalSetting}
          />
          <div className="bg-white p-8 rounded-b-xl">
            <div className="flex lg:flex-row flex-col justify-between items-center">
              <PDFDownloadLink
                document={
                  <InvoiceForDownload
                    data={data}
                    currency={currency}
                    globalSetting={globalSetting}
                    getNumberTwo={getNumberTwo}
                    showingTranslateValue={showingTranslateValue}
                    lang={lang}
                  />
                }
                fileName={`Invoice-${data?.invoice}.pdf`}
              >
                {({ blob, url, loading, error }) => (
                  <button className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center text-sm leading-4 font-medium text-center text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md">
                    <IoCloudDownloadOutline className="mr-2" />
                    Download Invoice
                  </button>
                )}
              </PDFDownloadLink>

              <div className="flex items-center space-x-3">
                {/* Edit Order Button - only show for Received orders */}
                <EditOrderButton order={data} />

                {/* Cancel Order Button - existing functionality */}
                <CancelOrderButton order={data} />

                <ReactToPrint
                  trigger={() => (
                    <button className="flex items-center text-sm leading-4 font-medium text-center text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md">
                      <IoPrintOutline className="mr-2" />
                      Print Invoice
                    </button>
                  )}
                  content={() => printRef.current}
                  documentTitle={`Invoice-${data?.invoice}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Order;

export const getServerSideProps = ({ params }) => {
  return {
    props: { params },
  };
}; 