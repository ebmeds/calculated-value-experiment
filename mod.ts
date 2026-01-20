import { z } from "zod";

type Observation = { value: number; dateTime: string };

const makeMeasurement = (value: number, dateTime: string) => ({
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "2857-1",
      },
    ],
  },
  "subject": {
    "reference": "Patient/123", // technical ID that doesn't actually resolve!
  },
  "effectiveDateTime": z.iso.date().parse(dateTime),
  "valueQuantity": {
    "value": value,
    "unit": "ug/L",
    "system": "http://unitsofmeasure.org",
    "code": "ug/L",
  },
});

const makeServiceCall = (observations: Observation[]) => ({
  "hook": "patient-view",
  "hookInstance": crypto.randomUUID(),
  "context": {
    "patientId": "Patient/123", // technical ID that doesn't actually resolve!
  },
  "prefetch": {
    "psa-time-series": {
      "resourceType": "Bundle",
      "type": "searchset",
      "entry": observations.map((o) => ({
        "resource": makeMeasurement(o.value, o.dateTime),
      })),
    },
  },
});

const testA: Observation[] = [
  { value: 0.0, dateTime: "2024-06-01" },
  { value: 0.0, dateTime: "2024-12-01" },
  { value: 0.1, dateTime: "2025-06-01" },
  { value: 0.2, dateTime: "2025-12-01" },
];

const testB: Observation[] = [
  { value: 2.4, dateTime: "2024-06-01" },
  { value: 2.5, dateTime: "2024-12-01" },
  { value: 3.9, dateTime: "2025-06-01" },
  { value: 8.2, dateTime: "2025-12-01" },
];

const tests = [testA, testB];

for (const test of tests) {
  const res = await fetch(
    Deno.args[0],
    {
      method: "POST",
      body: JSON.stringify(makeServiceCall(test)),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const json = await res.json();
  console.log(test);
  console.log(json);
}
