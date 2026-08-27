import React from 'react';
import ProcedureList from './ProcedureList.jsx';

export default function InServiceModule() {
  return (
    <ProcedureList
      route="inservice"
      category="In-Service Check"
      intro="Checks a laboratory runs on its own standards between scheduled calibrations, to catch drift or damage before the next round rather than after it."
      note="This tile is a placeholder. The source document has not been identified yet, and in-service checks may turn out to be governed by the cross-check procedures rather than a separate instruction — worth settling before the demo so the tile either points somewhere or is folded into cross-checks."
    />
  );
}
