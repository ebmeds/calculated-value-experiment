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

const body = makeServiceCall([
  { value: 4.2, dateTime: "2025-12-12" },
  { value: 4.3, dateTime: "2026-01-01" },
]);

console.log(JSON.stringify(body, null, 2));

const res = await fetch(
  Deno.args[0],
  {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
        'Content-Type': "application/json"
    }
  },
);

console.log(res);
