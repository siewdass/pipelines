import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { HiOutlinePlus } from "react-icons/hi2";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function Badges() {
  return (
    <div>
      <PageMeta
        title="React.js Badges Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Badges Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Badges" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="With Light Background">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="light" color="primary">
              Primary
            </Badge>
            <Badge variant="light" color="success">
              Success
            </Badge>{" "}
            <Badge variant="light" color="error">
              Error
            </Badge>{" "}
            <Badge variant="light" color="warning">
              Warning
            </Badge>{" "}
            <Badge variant="light" color="info">
              Info
            </Badge>
            <Badge variant="light" color="light">
              Light
            </Badge>
            <Badge variant="light" color="dark">
              Dark
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="With Solid Background">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="solid" color="primary">
              Primary
            </Badge>
            <Badge variant="solid" color="success">
              Success
            </Badge>{" "}
            <Badge variant="solid" color="error">
              Error
            </Badge>{" "}
            <Badge variant="solid" color="warning">
              Warning
            </Badge>{" "}
            <Badge variant="solid" color="info">
              Info
            </Badge>
            <Badge variant="solid" color="light">
              Light
            </Badge>
            <Badge variant="solid" color="dark">
              Dark
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Light Background with Left Icon">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="light" color="primary" startIcon={<HiOutlinePlus />}>
              Primary
            </Badge>
            <Badge variant="light" color="success" startIcon={<HiOutlinePlus />}>
              Success
            </Badge>{" "}
            <Badge variant="light" color="error" startIcon={<HiOutlinePlus />}>
              Error
            </Badge>{" "}
            <Badge variant="light" color="warning" startIcon={<HiOutlinePlus />}>
              Warning
            </Badge>{" "}
            <Badge variant="light" color="info" startIcon={<HiOutlinePlus />}>
              Info
            </Badge>
            <Badge variant="light" color="light" startIcon={<HiOutlinePlus />}>
              Light
            </Badge>
            <Badge variant="light" color="dark" startIcon={<HiOutlinePlus />}>
              Dark
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Solid Background with Left Icon">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" startIcon={<HiOutlinePlus />}>
              Primary
            </Badge>
            <Badge variant="solid" color="success" startIcon={<HiOutlinePlus />}>
              Success
            </Badge>{" "}
            <Badge variant="solid" color="error" startIcon={<HiOutlinePlus />}>
              Error
            </Badge>{" "}
            <Badge variant="solid" color="warning" startIcon={<HiOutlinePlus />}>
              Warning
            </Badge>{" "}
            <Badge variant="solid" color="info" startIcon={<HiOutlinePlus />}>
              Info
            </Badge>
            <Badge variant="solid" color="light" startIcon={<HiOutlinePlus />}>
              Light
            </Badge>
            <Badge variant="solid" color="dark" startIcon={<HiOutlinePlus />}>
              Dark
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Light Background with Right Icon">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="light" color="primary" endIcon={<HiOutlinePlus />}>
              Primary
            </Badge>
            <Badge variant="light" color="success" endIcon={<HiOutlinePlus />}>
              Success
            </Badge>{" "}
            <Badge variant="light" color="error" endIcon={<HiOutlinePlus />}>
              Error
            </Badge>{" "}
            <Badge variant="light" color="warning" endIcon={<HiOutlinePlus />}>
              Warning
            </Badge>{" "}
            <Badge variant="light" color="info" endIcon={<HiOutlinePlus />}>
              Info
            </Badge>
            <Badge variant="light" color="light" endIcon={<HiOutlinePlus />}>
              Light
            </Badge>
            <Badge variant="light" color="dark" endIcon={<HiOutlinePlus />}>
              Dark
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Solid Background with Right Icon">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" endIcon={<HiOutlinePlus />}>
              Primary
            </Badge>
            <Badge variant="solid" color="success" endIcon={<HiOutlinePlus />}>
              Success
            </Badge>{" "}
            <Badge variant="solid" color="error" endIcon={<HiOutlinePlus />}>
              Error
            </Badge>{" "}
            <Badge variant="solid" color="warning" endIcon={<HiOutlinePlus />}>
              Warning
            </Badge>{" "}
            <Badge variant="solid" color="info" endIcon={<HiOutlinePlus />}>
              Info
            </Badge>
            <Badge variant="solid" color="light" endIcon={<HiOutlinePlus />}>
              Light
            </Badge>
            <Badge variant="solid" color="dark" endIcon={<HiOutlinePlus />}>
              Dark
            </Badge>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
