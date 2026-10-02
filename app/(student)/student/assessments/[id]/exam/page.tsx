'use client';

import React from 'react';
import { ExamUI, ExamConfig } from '@/components/exam-ui';

const SAMPLE_EXAM: ExamConfig = {
  id: 'a1111111-1111-1111-1111-111111111111',
  title: 'ACLS Final Residency Proctored Examination (2026 Edition)',
  durationMinutes: 30,
  passPercentage: 75.0,
  negativeMarking: 0.25,
  questions: [
    {
      id: 'q-1',
      text: 'A 58-year-old male collapses in the ED waiting room. Monitor reveals Ventricular Fibrillation (VF). What is the immediate next priority action after initiating high-quality CPR?',
      explanation: 'In pulseless VF/pVT, immediate unsynchronized defibrillation at 120-200J (biphasic) is the primary intervention for ROSC.',
      marks: 1.0,
      options: [
        { id: 'opt-1a', text: 'Administer Epinephrine 1mg IV push', isCorrect: false },
        { id: 'opt-1b', text: 'Perform immediate unsynchronized defibrillation (120-200J biphasic)', isCorrect: true },
        { id: 'opt-1c', text: 'Perform endotracheal intubation', isCorrect: false },
        { id: 'opt-1d', text: 'Administer Amiodarone 300mg IV', isCorrect: false },
      ],
    },
    {
      id: 'q-2',
      text: 'During cardiac arrest with a non-shockable rhythm (Asystole/PEA), when should the first dose of Epinephrine be administered?',
      explanation: 'For non-shockable rhythms, Epinephrine 1mg IV/IO should be given as soon as feasible after CPR start.',
      marks: 1.0,
      options: [
        { id: 'opt-2a', text: 'As soon as feasible after CPR start', isCorrect: true },
        { id: 'opt-2b', text: 'Only after 2 cycles of CPR', isCorrect: false },
        { id: 'opt-2c', text: 'After 10 minutes of non-responsive CPR', isCorrect: false },
        { id: 'opt-2d', text: 'Only after atropine fails', isCorrect: false },
      ],
    },
    {
      id: 'q-3',
      text: 'What is the recommended target PetCO2 (End-Tidal CO2) value during high-quality CPR to indicate adequate chest compression fraction?',
      explanation: 'PetCO2 < 10 mmHg indicates low chest compression quality. Target PetCO2 > 10-20 mmHg.',
      marks: 1.0,
      options: [
        { id: 'opt-3a', text: '< 5 mmHg', isCorrect: false },
        { id: 'opt-3b', text: '> 10 to 20 mmHg', isCorrect: true },
        { id: 'opt-3c', text: '> 45 mmHg', isCorrect: false },
        { id: 'opt-3d', text: 'PetCO2 cannot be monitored during CPR', isCorrect: false },
      ],
    },
    {
      id: 'q-4',
      text: 'In refractory Ventricular Fibrillation after 2 shocks and 1 dose of Epinephrine, what is the recommended initial IV dose of Amiodarone?',
      explanation: 'First dose of Amiodarone in refractory VF/pVT is 300 mg IV/IO bolus, followed by a second dose of 150 mg.',
      marks: 1.0,
      options: [
        { id: 'opt-4a', text: '150 mg IV bolus', isCorrect: false },
        { id: 'opt-4b', text: '300 mg IV/IO bolus', isCorrect: true },
        { id: 'opt-4c', text: '1 mg/kg IV', isCorrect: false },
        { id: 'opt-4d', text: '1 gram IV drip over 1 hour', isCorrect: false },
      ],
    },
    {
      id: 'q-5',
      text: 'A patient with symptomatic Bradycardia (HR 34 bpm, BP 82/50) fails to respond to Atropine 1mg IV. What is the recommended second-line therapy?',
      explanation: 'Transcutaneous pacing or continuous infusion of Dopamine (5-20 mcg/kg/min) or Epinephrine (2-10 mcg/min) is indicated for atropine-refractory symptomatic bradycardia.',
      marks: 1.0,
      options: [
        { id: 'opt-5a', text: 'Transcutaneous pacing or Epinephrine/Dopamine infusion', isCorrect: true },
        { id: 'opt-5b', text: 'Adenosine 6mg rapid IV push', isCorrect: false },
        { id: 'opt-5c', text: 'Amiodarone 150mg IV drip', isCorrect: false },
        { id: 'opt-5d', text: 'Metoprolol 5mg IV push', isCorrect: false },
      ],
    },
  ],
};

export default function ExamPage() {
  return <ExamUI exam={SAMPLE_EXAM} />;
}
