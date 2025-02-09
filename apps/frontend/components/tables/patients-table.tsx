import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Link } from "next-view-transitions";

const demo_patients = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    phone: "1234567890",
  },
];

const PatientsTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Language</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right pr-4">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demo_patients.map(
          (patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
          }) => (
            <TableRow key={patient.id}>
              <TableCell>
                {patient.firstName} {patient.lastName}
              </TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link prefetch={false} href={`/patients/${patient.id}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};

export default PatientsTable;
