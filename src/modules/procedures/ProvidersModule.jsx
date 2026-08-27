import React from 'react';
import ProcedureList from './ProcedureList.jsx';

export default function ProvidersModule() {
  return (
    <ProcedureList
      route="providers"
      category="Service Providers"
      intro="Providers authorised to service and repair calibration standards. Held on MEASURE and maintained there, so this tile points at the source rather than keeping a copy that would go stale."
    />
  );
}
