export interface MockTestOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MockTestQuestion {
  id: string;
  text: string;
  explanation: string;
  marks: number;
  subject: string;
  topic: string;
  options: MockTestOption[];
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  passPercentage: number;
  negativeMarking: number;
  maxAttempts: number;
  cooldownMinutes: number;
  courseId?: string;
  questions: MockTestQuestion[];
}

export interface MockTestAttempt {
  attemptId: string;
  testId: string;
  userId: string;
  attemptNumber: number;
  status: 'in_progress' | 'completed';
  startedAt: string;
  expiresAt: string;
  questionsSnapshot: MockTestQuestion[];
  selectedAnswers: Record<string, string>;
  submittedAt?: string;
  score?: number;
  maxPossibleScore?: number;
  percentage?: number;
  result?: 'pass' | 'fail';
  timeSpentSeconds?: number;
}

export const MOCK_TEST_STORAGE_KEY = 'kem_mock_test_attempts';

export const MOCK_TESTS: MockTest[] = [
  {
    id: 'airway-rsi-practice',
    title: 'Emergency Airway & RSI Practice',
    subject: 'Emergency Medicine',
    topic: 'Airway management',
    durationMinutes: 20,
    passPercentage: 70,
    negativeMarking: 0.25,
    maxAttempts: 3,
    cooldownMinutes: 5,
    courseId: 'c1111111-1111-1111-1111-111111111111',
    questions: [
      {
        id: 'airway-q1',
        text: 'A patient with a difficult airway needs rapid sequence intubation. Which step best prepares for a failed first attempt?',
        explanation: 'A planned rescue strategy, including a second-generation supraglottic airway and front-of-neck access plan, reduces delay when intubation fails.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Airway management',
        options: [
          { id: 'airway-q1-a', text: 'Prepare a rescue airway and agree on a failed-intubation plan', isCorrect: true },
          { id: 'airway-q1-b', text: 'Give repeated induction doses before reassessing', isCorrect: false },
          { id: 'airway-q1-c', text: 'Remove all airway equipment not needed for the first attempt', isCorrect: false },
          { id: 'airway-q1-d', text: 'Delay preoxygenation until the laryngoscope is ready', isCorrect: false },
        ],
      },
      {
        id: 'airway-q2',
        text: 'Which intervention most directly improves oxygen reserve before induction in a critically ill adult?',
        explanation: 'Effective preoxygenation replaces nitrogen in the functional residual capacity with oxygen, extending safe apnea time.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Preoxygenation',
        options: [
          { id: 'airway-q2-a', text: 'Provide high-concentration oxygen with an effective mask seal', isCorrect: true },
          { id: 'airway-q2-b', text: 'Administer a maintenance crystalloid bolus', isCorrect: false },
          { id: 'airway-q2-c', text: 'Place the patient supine without head elevation', isCorrect: false },
          { id: 'airway-q2-d', text: 'Withhold oxygen to preserve respiratory drive', isCorrect: false },
        ],
      },
      {
        id: 'airway-q3',
        text: 'After a first laryngoscopy attempt fails, oxygen saturation remains stable and mask ventilation is effective. What is the best next step?',
        explanation: 'Optimize the next attempt by changing a correctable factor such as position, blade, operator, or adjunct rather than repeating an unchanged approach.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Failed intubation',
        options: [
          { id: 'airway-q3-a', text: 'Optimize the conditions and make a planned second attempt', isCorrect: true },
          { id: 'airway-q3-b', text: 'Continue repeated attempts with the same setup', isCorrect: false },
          { id: 'airway-q3-c', text: 'Stop ventilation while selecting another device', isCorrect: false },
          { id: 'airway-q3-d', text: 'Proceed directly to extubation without reassessment', isCorrect: false },
        ],
      },
      {
        id: 'airway-q4',
        text: 'Which finding is the most reliable immediate confirmation of tracheal tube placement in a perfusing patient?',
        explanation: 'A sustained waveform on quantitative capnography is the preferred method for confirming and continuously monitoring tracheal placement.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Tube confirmation',
        options: [
          { id: 'airway-q4-a', text: 'Sustained waveform capnography', isCorrect: true },
          { id: 'airway-q4-b', text: 'Fogging inside the tube', isCorrect: false },
          { id: 'airway-q4-c', text: 'Symmetric chest movement alone', isCorrect: false },
          { id: 'airway-q4-d', text: 'Auscultation of the epigastrium alone', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'resuscitation-core-review',
    title: 'Resuscitation Core Review',
    subject: 'Emergency Medicine',
    topic: 'Cardiac arrest',
    durationMinutes: 15,
    passPercentage: 75,
    negativeMarking: 0,
    maxAttempts: 2,
    cooldownMinutes: 0,
    courseId: 'c1111111-1111-1111-1111-111111111111',
    questions: [
      {
        id: 'arrest-q1',
        text: 'A monitor shows ventricular fibrillation during cardiac arrest. What is the priority intervention?',
        explanation: 'Ventricular fibrillation is a shockable rhythm; prompt defibrillation with high-quality CPR is the priority.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Shockable rhythms',
        options: [
          { id: 'arrest-q1-a', text: 'Deliver an unsynchronized shock and resume CPR', isCorrect: true },
          { id: 'arrest-q1-b', text: 'Give atropine and wait for a rhythm change', isCorrect: false },
          { id: 'arrest-q1-c', text: 'Pause compressions for prolonged rhythm analysis', isCorrect: false },
          { id: 'arrest-q1-d', text: 'Perform synchronized cardioversion', isCorrect: false },
        ],
      },
      {
        id: 'arrest-q2',
        text: 'For pulseless electrical activity, when should epinephrine be administered during resuscitation?',
        explanation: 'For a non-shockable rhythm, administer epinephrine as soon as feasible while continuing CPR and treating reversible causes.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'Non-shockable rhythms',
        options: [
          { id: 'arrest-q2-a', text: 'As soon as feasible', isCorrect: true },
          { id: 'arrest-q2-b', text: 'Only after the third defibrillation', isCorrect: false },
          { id: 'arrest-q2-c', text: 'Only after return of spontaneous circulation', isCorrect: false },
          { id: 'arrest-q2-d', text: 'After stopping CPR for five minutes', isCorrect: false },
        ],
      },
      {
        id: 'arrest-q3',
        text: 'Which action best supports high-quality CPR?',
        explanation: 'High-quality CPR uses an appropriate rate and depth, allows complete recoil, and minimizes interruptions.',
        marks: 1,
        subject: 'Emergency Medicine',
        topic: 'CPR quality',
        options: [
          { id: 'arrest-q3-a', text: 'Allow complete chest recoil and minimize interruptions', isCorrect: true },
          { id: 'arrest-q3-b', text: 'Pause compressions after every ventilation', isCorrect: false },
          { id: 'arrest-q3-c', text: 'Use shallow compressions to prevent fatigue', isCorrect: false },
          { id: 'arrest-q3-d', text: 'Avoid rotating compressors during prolonged CPR', isCorrect: false },
        ],
      },
    ],
  },
];

export function readMockTestAttempts(userId: string): MockTestAttempt[] {
  try {
    const saved = localStorage.getItem(MOCK_TEST_STORAGE_KEY);
    const attempts = saved ? (JSON.parse(saved) as MockTestAttempt[]) : [];
    return attempts.filter((attempt) => attempt.userId === userId);
  } catch {
    return [];
  }
}

export function saveMockTestAttempt(attempt: MockTestAttempt) {
  try {
    const saved = localStorage.getItem(MOCK_TEST_STORAGE_KEY);
    const attempts = saved ? (JSON.parse(saved) as MockTestAttempt[]) : [];
    const updated = attempts.filter((item) => item.attemptId !== attempt.attemptId);
    updated.push(attempt);
    localStorage.setItem(MOCK_TEST_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(MOCK_TEST_STORAGE_KEY, JSON.stringify([attempt]));
  }
}

export function createQuestionSnapshot(test: MockTest): MockTestQuestion[] {
  const shuffle = <T,>(items: T[]) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  return shuffle(test.questions).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
}