import {
  Card,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import {
  MdOutlineLocationOn,
  MdOutlineLocationCity,
  MdGroups,
} from "react-icons/md";
import { Location, Parameter } from "../services/openaq";
import { useCallback } from "react";

const ParametersTable = ({ parameters }: { parameters: Parameter[] }) => {
  const columns = [
    { name: "Parameter", uid: "parameter" },
    { name: "Unit", uid: "unit" },
    { name: "Count", uid: "count" },
    { name: "Average", uid: "average" },
    { name: "Last Value", uid: "lastValue" },
    { name: "Last Updated", uid: "lastUpdated" },
  ];

  const renderCell = useCallback(
    (parameter: Parameter, columnKey: React.Key) => {
      switch (columnKey) {
        case "parameter":
          return parameter.parameter;
        case "unit":
          return parameter.unit;
        case "count":
          return parameter.count;
        case "average":
          return new Intl.NumberFormat("en-US", {
            style: "decimal",
            maximumFractionDigits: 3,
          }).format(parameter.average);
        case "lastValue":
          return new Intl.NumberFormat("en-US", {
            style: "decimal",
            maximumFractionDigits: 3,
          }).format(parameter.lastValue);
        case "lastUpdated":
          return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(parameter.lastUpdated));
        default:
          return "";
      }
    },
    []
  );

  return (
    <Table
      className="w-full border border-gray-100 rounded-lg [&_th]:!rounded-b-none"
      shadow="none"
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
      </TableHeader>
      <TableBody items={parameters}>
        {(parameter) => (
          <TableRow key={parameter.id}>
            {(columnKey) => (
              <TableCell key={columnKey}>
                {renderCell(parameter, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

interface CardComponentProps {
  location: Location;
}
const CardComponent = ({ location }: CardComponentProps) => {
  return (
    <Card shadow="md" radius="md" isBlurred fullWidth>
      <CardBody>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center w-1/3">
            <MdOutlineLocationCity className="text-2xl text-gray-500" />
            <p className="ml-2 font-bold text-xs sm:text-sm md:text-base text-balance line-clamp-2">{`${
              location.name
            }, ${location.city !== null ? location.city + ", " : ""}${
              location.country
            }`}</p>
          </div>
          <div className="flex items-center w-1/3">
            <MdOutlineLocationOn className="text-2xl text-gray-500" />
            <p className="ml-2 font-medium text-xs sm:text-sm md:text-base text-balance line-clamp-2">{`${location.coordinates.latitude.toFixed(
              8
            )}, ${location.coordinates.longitude.toFixed(8)}`}</p>
          </div>
          {location.manufacturers && (
            <div className="flex items-center w-1/3">
              <MdGroups className="text-2xl text-gray-500" />
              <p className="ml-2 font-medium text-xs sm:text-sm md:text-base text-balance line-clamp-2">
                {location.manufacturers[0].modelName}
              </p>
            </div>
          )}
        </div>
        <Divider className="my-4 bg-gray-100" />
        <ParametersTable parameters={location.parameters} />
      </CardBody>
    </Card>
  );
};

export default CardComponent;
