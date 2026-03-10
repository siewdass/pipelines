import { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { renderers } from "../../components/form";
import ComponentCard from "../../components/common/ComponentCard";

const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
    },
    email: {
      type: "string",
      format: "email",
    },
    age: {
      type: "integer",
      minimum: 18,
    },
    active: {
      type: "boolean",
    },
    birthdate: {
      type: "string",
      format: "date",
    },
    meetingTime: {
      type: "string",
      format: "time",
    },
    country: {
      type: "string",
      enum: ["Argentina", "Brasil", "Chile", "Colombia"],
    },
    skills: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: ["JavaScript", "TypeScript", "React", "Node.js"],
      },
    },
    message: {
      type: "string",
    },
  },
  required: ["name", "country"],
};

export default function FormElements() {
  const [data, setData] = useState<Record<string, unknown>>({ name: "" });

  return (
    <div>
      <PageMeta
        title="React.js Form Elements | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements page using JSON Forms"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Basic Information">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
            <JsonForms
              schema={schema}
              uischema={{
                type: "VerticalLayout",
                elements: [
                  { type: "Control", scope: "#/properties/name", label: "Full Name" },
                  { type: "Control", scope: "#/properties/email", label: "Email Address" },
                  { type: "Control", scope: "#/properties/age", label: "Age" },
                ]
              }}
              data={data}
              renderers={renderers}
              onChange={({ data }) => setData(data)}
            />
          </div>
        </ComponentCard>

        <ComponentCard title="Selection & Dates">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
            <JsonForms
              schema={schema}
              uischema={{
                type: "VerticalLayout",
                elements: [
                  { type: "Control", scope: "#/properties/country", label: "Country Selection" },
                  { type: "Control", scope: "#/properties/birthdate", label: "Date of Birth" },
                  { type: "Control", scope: "#/properties/meetingTime", label: "Meeting Time" },
                  { type: "Control", scope: "#/properties/active", label: "Active Status" },
                ]
              }}
              data={data}
              renderers={renderers}
              onChange={({ data }) => setData(data)}
            />
          </div>
        </ComponentCard>

        <ComponentCard title="Skills (Multi-select)">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
            <JsonForms
              schema={schema}
              uischema={{
                type: "VerticalLayout",
                elements: [
                  { type: "Control", scope: "#/properties/skills", label: "Select Multiple Skills" },
                ]
              }}
              data={data}
              renderers={renderers}
              onChange={({ data }) => setData(data)}
            />
          </div>
        </ComponentCard>

        <ComponentCard title="Resulting JSON Data">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg h-full">
            <pre className="text-sm overflow-auto max-h-[300px]">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
