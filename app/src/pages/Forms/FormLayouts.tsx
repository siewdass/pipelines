import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function FormElements() {

  return (
    <div>
      <PageMeta
        title="React.js Form Elements | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements page using the dynamic Form component"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Dynamic Form Generation">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">

          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
