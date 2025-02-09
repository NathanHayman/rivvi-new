"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { Table } from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import { Download, Eye, Search } from "lucide-react";
import { useState } from "react";

const demo_participants = [
  {
    id: "1",
    patientId: "1",
    status: "confirmed",
    metadata: {
      patientFirstName: "John",
      patientLastName: "Doe",
      patientPhone: "1234567890",
      appointmentDateTime: new Date(),
      appointmentType: "In-Person",
      providerName: "Dr. Smith",
      locationName: "Clinic A",
    },
    lastCallStatus: "completed",
  },
];

const ParticipantsTable: React.FC = () => {
  const [search, setSearch] = useState("");

  const handleExport = () => {
    console.log("Exporting participants");
  };

  return (
    <div className="p-2 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Participants</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <Table className="">
        <TableHeader className="px-4">
          <TableRow className="px-4">
            <TableHead className="px-4">Patient ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Appointment</TableHead>
            <TableHead>Appointment Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Call</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demo_participants.map((participant) => (
            <TableRow key={participant.id} className="[&_td]:h-16">
              <TableCell className="py-4">{participant.patientId}</TableCell>
              <TableCell>
                {String(participant.metadata.patientFirstName)}
              </TableCell>
              <TableCell>
                {String(participant.metadata.patientLastName)}
              </TableCell>
              <TableCell>{String(participant.metadata.patientPhone)}</TableCell>
              <TableCell>
                {participant.metadata.appointmentDateTime instanceof Date
                  ? participant.metadata.appointmentDateTime.toLocaleString()
                  : String(participant.metadata.appointmentDateTime)}
              </TableCell>
              <TableCell>
                {String(participant.metadata.appointmentType)}
              </TableCell>
              <TableCell>{String(participant.metadata.providerName)}</TableCell>
              <TableCell>{String(participant.metadata.locationName)}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    participant.status === "confirmed" &&
                      "bg-green-600/20 text-green-600 hover:bg-green-600/30",
                    participant.status === "declined" &&
                      "bg-red-600/20 text-red-600 hover:bg-red-600/30",
                    participant.status === "unreachable" &&
                      "bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30",
                    participant.status === "pending" &&
                      "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30"
                  )}
                >
                  {participant.status}
                </Badge>
              </TableCell>
              <TableCell>
                {/* if the call has completed, render a button to view the call */}
                {participant.lastCallStatus === "completed" && (
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    View Call
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ParticipantsTable;
