import React from 'react';
import ProcedureList from './ProcedureList.jsx';

export default function CrossCheckModule() {
  return (
    <ProcedureList
      route="crosscheck"
      category="Cross-Check"
      intro="Procedures governing comparisons between laboratories. Both documents are held on MEASURE and open in a new tab; a CAC is needed to download them."
    />
  );
}
