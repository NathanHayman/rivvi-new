import Breadcrumbs from "@/components/layout/breadcrumbs";
import Header from "@/components/layout/header";
import { Body, Content, Shell } from "@/components/layout/shell";
import { SummaryCards } from "@/components/summary-cards";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ patientId: string }>;
};

const demo_patients = [
  { id: "1", firstName: "John", lastName: "Doe", phone: "1234567890" },
  { id: "2", firstName: "Jane", lastName: "Smith", phone: "0987654321" },
];

const demo_appointments = [
  {
    id: "1",
    patientId: "1",
    type: "Appointment",
    location: "Clinic",
    datetime: new Date(),
  },
  {
    id: "2",
    patientId: "2",
    type: "Call",
    location: "Home",
    datetime: new Date(),
  },
];

export default async function PatientPage({ params }: PageProps) {
  const { patientId } = await params;
  const patient = demo_patients.find((p) => p.id === patientId);

  if (!patient) {
    return notFound();
  }

  const patientAppointments = demo_appointments.filter(
    (a) => a.patientId === patientId
  );

  return (
    <Shell>
      <Breadcrumbs
        breadcrumbs={[
          { title: "Patients", href: "/patients" },
          {
            title: `${patient.firstName} ${patient.lastName}`,
            href: `/patients/${patientId}`,
          },
        ]}
      />
      <Body>
        <Header
          className=""
          title={`${patient.firstName} ${patient.lastName}`}
          buttons={
            <>
              <Link
                href={`/patients/${patientId}/calls`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Calls
              </Link>
            </>
          }
        />
        <Content>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{patient.phone}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patientAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex justify-between border-b py-2"
                  >
                    <div>
                      <div className="font-medium">{appointment.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{appointment.datetime.toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.datetime.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <SummaryCards
              cards={[
                {
                  title: "Total Appointments",
                  value: patientAppointments.length.toString(),
                },
                { title: "Completed Calls", value: "0" },
                { title: "Failed Calls", value: "0" },
                { title: "Upcoming Calls", value: "0" },
              ]}
            />
          </div>
        </Content>
      </Body>
    </Shell>
  );
}
