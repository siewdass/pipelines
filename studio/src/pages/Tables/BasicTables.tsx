import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RecentOrders from "../../components/ecommerce/RecentOrders";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | Pipelines - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for Pipelines - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Projects" />
      
      <div className="space-y-6">
        <RecentOrders />
      </div>
    </>
  );
}
