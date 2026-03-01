const SEMESTERS_MAP_INTERNAL = {
  1: [
    { id: 'cs101', name: 'Engineering Mathematics I', code: 'MA101' },
    { id: 'cs102', name: 'Engineering Physics', code: 'PH101' },
    { id: 'cs103', name: 'Basic Electronics', code: 'EC101' },
    { id: 'cs104', name: 'Programming in C', code: 'CS101' },
  ],
  2: [
    { id: 'cs201', name: 'Engineering Mathematics II', code: 'MA201' },
    { id: 'cs202', name: 'Engineering Chemistry', code: 'CH201' },
    { id: 'cs203', name: 'Data Structures', code: 'CS201' },
    { id: 'cs204', name: 'Digital Electronics', code: 'EC201' },
  ],
  3: [
    { id: 'cs301', name: 'Object Oriented Programming', code: 'CS301' },
    { id: 'cs302', name: 'Discrete Mathematics', code: 'MA301' },
    { id: 'cs303', name: 'Computer Organization', code: 'CS302' },
    { id: 'cs304', name: 'Database Management Systems', code: 'CS303' },
  ],
  4: [
    { id: 'cs401', name: 'Operating Systems', code: 'CS401' },
    { id: 'cs402', name: 'Computer Networks', code: 'CS402' },
    { id: 'cs403', name: 'Theory of Computation', code: 'CS403' },
    { id: 'cs404', name: 'Software Engineering', code: 'CS404' },
  ],
  5: [
    { id: 'cs501', name: 'Compiler Design', code: 'CS501' },
    { id: 'cs502', name: 'Artificial Intelligence', code: 'CS502' },
    { id: 'cs503', name: 'Web Technologies', code: 'CS503' },
    { id: 'cs504', name: 'Information Security', code: 'CS504' },
  ],
  6: [
    { id: 'cs601', name: 'Machine Learning', code: 'CS601' },
    { id: 'cs602', name: 'Cloud Computing', code: 'CS602' },
    { id: 'cs603', name: 'Mobile Application Development', code: 'CS603' },
    { id: 'cs604', name: 'Big Data Analytics', code: 'CS604' },
  ],
  7: [
    { id: 'cs701', name: 'Deep Learning', code: 'CS701' },
    { id: 'cs702', name: 'Distributed Systems', code: 'CS702' },
    { id: 'cs703', name: 'Cyber Security', code: 'CS703' },
  ],
  8: [
    { id: 'cs801', name: 'Project Work', code: 'CS801' },
    { id: 'cs802', name: 'Seminar and Technical Writing', code: 'CS802' },
    { id: 'cs803', name: 'Elective IV', code: 'CS803' },
  ],
};

export const SEMESTERS_MAP = SEMESTERS_MAP_INTERNAL;

export const SEMESTERS = Object.entries(SEMESTERS_MAP).map(([semester, subjects]) => ({
  semester: Number(semester),
  label: `Semester ${semester}`,
  subjects,
}));

export const SEMESTER_OPTIONS = SEMESTERS.map((entry) => entry.semester);

const SUBJECT_LOOKUP = Object.values(SEMESTERS_MAP)
  .flat()
  .reduce((acc, subject) => {
    acc[subject.id] = subject;
    return acc;
  }, {});

const ALL_SUBJECT_IDS = Object.keys(SUBJECT_LOOKUP);

const UNIT_COLORS = ['violet', 'blue', 'emerald', 'amber', 'rose'];
const DEFAULT_PROGRESS = [82, 64, 42, 20, 0];

const SPECIAL_UNITS = {
  cs101: [
    { id: 'u1', number: 1, name: 'Differential Calculus', teacher: 'Dr. Priya Sharma', materialCount: 12, progress: 88, color: 'violet' },
    { id: 'u2', number: 2, name: 'Integral Calculus', teacher: 'Dr. Priya Sharma', materialCount: 10, progress: 71, color: 'blue' },
    { id: 'u3', number: 3, name: 'Differential Equations', teacher: 'Dr. Ravi Kumar', materialCount: 11, progress: 44, color: 'emerald' },
    { id: 'u4', number: 4, name: 'Fourier Series', teacher: 'Dr. Ravi Kumar', materialCount: 9, progress: 18, color: 'amber' },
    { id: 'u5', number: 5, name: 'Laplace Transform', teacher: 'Dr. Priya Sharma', materialCount: 7, progress: 0, color: 'rose' },
  ],
  cs203: [
    { id: 'u1', number: 1, name: 'Arrays and Strings', teacher: 'Prof. Leela Menon', materialCount: 8, progress: 90, color: 'violet' },
    { id: 'u2', number: 2, name: 'Linked Lists and Stacks', teacher: 'Prof. Leela Menon', materialCount: 9, progress: 75, color: 'blue' },
    { id: 'u3', number: 3, name: 'Trees and Graphs', teacher: 'Prof. Arvind Nair', materialCount: 12, progress: 53, color: 'emerald' },
    { id: 'u4', number: 4, name: 'Hashing and Heaps', teacher: 'Prof. Arvind Nair', materialCount: 8, progress: 21, color: 'amber' },
    { id: 'u5', number: 5, name: 'Complexity and Revision', teacher: 'Prof. Leela Menon', materialCount: 6, progress: 0, color: 'rose' },
  ],
  cs401: [
    { id: 'u1', number: 1, name: 'Processes and Threads', teacher: 'Dr. Kiran Rao', materialCount: 13, progress: 84, color: 'violet' },
    { id: 'u2', number: 2, name: 'CPU Scheduling', teacher: 'Dr. Kiran Rao', materialCount: 10, progress: 67, color: 'blue' },
    { id: 'u3', number: 3, name: 'Memory Management', teacher: 'Dr. Leena Pillai', materialCount: 11, progress: 38, color: 'emerald' },
    { id: 'u4', number: 4, name: 'Deadlocks and Sync', teacher: 'Dr. Leena Pillai', materialCount: 9, progress: 15, color: 'amber' },
    { id: 'u5', number: 5, name: 'Security and Case Studies', teacher: 'Dr. Kiran Rao', materialCount: 8, progress: 0, color: 'rose' },
  ],
  cs502: [
    { id: 'u1', number: 1, name: 'Problem Solving Agents', teacher: 'Prof. Geeta Jain', materialCount: 10, progress: 79, color: 'violet' },
    { id: 'u2', number: 2, name: 'Knowledge Representation', teacher: 'Prof. Geeta Jain', materialCount: 9, progress: 56, color: 'blue' },
    { id: 'u3', number: 3, name: 'Search and Optimization', teacher: 'Dr. Arjun Das', materialCount: 12, progress: 41, color: 'emerald' },
    { id: 'u4', number: 4, name: 'Game Playing and Logic', teacher: 'Dr. Arjun Das', materialCount: 8, progress: 22, color: 'amber' },
    { id: 'u5', number: 5, name: 'AI Ethics and Applications', teacher: 'Prof. Geeta Jain', materialCount: 7, progress: 0, color: 'rose' },
  ],
};

function buildDefaultUnits(subjectId) {
  const subject = SUBJECT_LOOKUP[subjectId];
  const shortName = subject.name.split(' ').slice(0, 2).join(' ');
  const teachers = ['Dr. A. Iyer', 'Prof. V. Singh', 'Dr. R. Menon', 'Prof. N. Das', 'Dr. K. Shah'];
  const unitNames = [
    `${shortName} Fundamentals`,
    `${shortName} Core Concepts`,
    `${shortName} Applications`,
    `${shortName} Advanced Topics`,
    `${shortName} Revision and Problems`,
  ];

  return unitNames.map((name, index) => ({
    id: `u${index + 1}`,
    number: index + 1,
    name,
    teacher: teachers[index],
    materialCount: 6 + index,
    progress: DEFAULT_PROGRESS[index],
    color: UNIT_COLORS[index],
  }));
}

export const UNITS_BY_SUBJECT = ALL_SUBJECT_IDS.reduce((acc, subjectId) => {
  acc[subjectId] = SPECIAL_UNITS[subjectId] || buildDefaultUnits(subjectId);
  return acc;
}, {});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function formatDate(seed) {
  const month = MONTHS[seed % MONTHS.length];
  const day = `${((seed * 3) % 27) + 1}`.padStart(2, '0');
  return `${month} ${day}, 2026`;
}

function makeMaterialId(subjectId, unitId, index) {
  return `${subjectId}_${unitId}_m${index + 1}`;
}

function buildDefaultMaterials(subjectId) {
  const units = UNITS_BY_SUBJECT[subjectId] || [];
  return units.map((unit, unitIndex) => ({
    unitId: unit.id,
    unitName: unit.name,
    files: [
      {
        id: makeMaterialId(subjectId, unit.id, 0),
        name: `${unit.name} Lecture Notes.pdf`,
        type: 'pdf',
        date: formatDate(unitIndex + 1),
        teacher: unit.teacher,
        size: `${(1.6 + unitIndex * 0.4).toFixed(1)} MB`,
      },
      {
        id: makeMaterialId(subjectId, unit.id, 1),
        name: `${unit.name} Worked Examples.pdf`,
        type: 'pdf',
        date: formatDate(unitIndex + 3),
        teacher: unit.teacher,
        size: `${(1.2 + unitIndex * 0.3).toFixed(1)} MB`,
      },
      {
        id: makeMaterialId(subjectId, unit.id, 2),
        name: `${unit.name} Visual Summary`,
        type: 'image',
        date: formatDate(unitIndex + 5),
        teacher: unit.teacher,
        size: `${260 + unitIndex * 70} KB`,
      },
      {
        id: makeMaterialId(subjectId, unit.id, 3),
        name: `${unit.name} External Resource`,
        type: 'link',
        date: formatDate(unitIndex + 7),
        teacher: unit.teacher,
        url: '#',
      },
    ],
  }));
}

export const MATERIALS_BY_SUBJECT = ALL_SUBJECT_IDS.reduce((acc, subjectId) => {
  acc[subjectId] = buildDefaultMaterials(subjectId);
  return acc;
}, {});

MATERIALS_BY_SUBJECT.cs101 = [
  {
    unitId: 'u1',
    unitName: 'Differential Calculus',
    files: [
      { id: 'cs101_u1_m1', name: 'Limits and Continuity Notes.pdf', type: 'pdf', date: 'Jan 05, 2026', teacher: 'Dr. Priya Sharma', size: '2.4 MB' },
      { id: 'cs101_u1_m2', name: 'Derivative Rules Quick Sheet.png', type: 'image', date: 'Jan 08, 2026', teacher: 'Dr. Priya Sharma', size: '380 KB' },
      { id: 'cs101_u1_m3', name: 'Derivative Practice Set.pdf', type: 'pdf', date: 'Jan 12, 2026', teacher: 'Dr. Ravi Kumar', size: '1.8 MB' },
      { id: 'cs101_u1_m4', name: 'Khan Academy: Derivatives Playlist', type: 'link', date: 'Jan 14, 2026', teacher: 'Dr. Ravi Kumar', url: '#' },
    ],
  },
  {
    unitId: 'u2',
    unitName: 'Integral Calculus',
    files: [
      { id: 'cs101_u2_m1', name: 'Integration Basics.pdf', type: 'pdf', date: 'Jan 18, 2026', teacher: 'Dr. Priya Sharma', size: '2.0 MB' },
      { id: 'cs101_u2_m2', name: 'Integration by Parts Guide.pdf', type: 'pdf', date: 'Jan 21, 2026', teacher: 'Dr. Priya Sharma', size: '1.5 MB' },
      { id: 'cs101_u2_m3', name: 'Definite Integrals Cheatsheet.png', type: 'image', date: 'Jan 24, 2026', teacher: 'Dr. Ravi Kumar', size: '410 KB' },
      { id: 'cs101_u2_m4', name: 'MIT OCW: Integration Review', type: 'link', date: 'Jan 27, 2026', teacher: 'Dr. Ravi Kumar', url: '#' },
    ],
  },
  {
    unitId: 'u3',
    unitName: 'Differential Equations',
    files: [
      { id: 'cs101_u3_m1', name: 'First Order ODE Notes.pdf', type: 'pdf', date: 'Feb 02, 2026', teacher: 'Dr. Ravi Kumar', size: '2.1 MB' },
      { id: 'cs101_u3_m2', name: 'Second Order ODE Examples.pdf', type: 'pdf', date: 'Feb 05, 2026', teacher: 'Dr. Ravi Kumar', size: '1.9 MB' },
      { id: 'cs101_u3_m3', name: 'ODE Visual Flowchart.png', type: 'image', date: 'Feb 08, 2026', teacher: 'Dr. Priya Sharma', size: '470 KB' },
    ],
  },
  {
    unitId: 'u4',
    unitName: 'Fourier Series',
    files: [
      { id: 'cs101_u4_m1', name: 'Fourier Series Intro.pdf', type: 'pdf', date: 'Feb 15, 2026', teacher: 'Dr. Ravi Kumar', size: '2.6 MB' },
      { id: 'cs101_u4_m2', name: 'Fourier Coefficients Worksheet.pdf', type: 'pdf', date: 'Feb 19, 2026', teacher: 'Dr. Ravi Kumar', size: '1.4 MB' },
      { id: 'cs101_u4_m3', name: 'Fourier Visualizer Tool', type: 'link', date: 'Feb 20, 2026', teacher: 'Dr. Priya Sharma', url: '#' },
    ],
  },
  {
    unitId: 'u5',
    unitName: 'Laplace Transform',
    files: [
      { id: 'cs101_u5_m1', name: 'Laplace Transform Table.pdf', type: 'pdf', date: 'Feb 24, 2026', teacher: 'Dr. Priya Sharma', size: '1.2 MB' },
      { id: 'cs101_u5_m2', name: 'Inverse Laplace Practice.pdf', type: 'pdf', date: 'Feb 28, 2026', teacher: 'Dr. Priya Sharma', size: '1.7 MB' },
      { id: 'cs101_u5_m3', name: 'Laplace Worked Solutions.png', type: 'image', date: 'Mar 01, 2026', teacher: 'Dr. Ravi Kumar', size: '350 KB' },
    ],
  },
];

function withCommentCount(thread) {
  return {
    ...thread,
    commentCount: thread.comments.length,
  };
}

function buildDefaultThreads(subjectId) {
  const subject = SUBJECT_LOOKUP[subjectId];
  const units = UNITS_BY_SUBJECT[subjectId] || [];
  return [
    withCommentCount({
      id: `${subjectId}_t1`,
      title: `Need help with ${units[0]?.name || 'Unit 1'} concepts`,
      description: `I am revising ${subject.name}. Can someone share a simple way to remember the important points from Unit 1?`,
      tags: ['Unit 1', 'Help'],
      author: { name: 'Arjun Mehta', avatar: 'AM' },
      upvotes: 14,
      downvotes: 1,
      timeAgo: '3 hours ago',
      comments: [
        {
          id: `${subjectId}_t1_c1`,
          author: { name: 'Sneha Patel', avatar: 'SP' },
          text: 'Start with lecture notes first, then solve two short question sets before moving to previous year questions.',
          timeAgo: '2 hours ago',
          upvotes: 7,
        },
      ],
    }),
    withCommentCount({
      id: `${subjectId}_t2`,
      title: `${subject.code} exam prep strategy thread`,
      description: 'Sharing preparation plans for the upcoming internal test. Add your strategy and timeline.',
      tags: ['Exam', 'Strategy'],
      author: { name: 'Riya Verma', avatar: 'RV' },
      upvotes: 21,
      downvotes: 0,
      timeAgo: '9 hours ago',
      comments: [
        {
          id: `${subjectId}_t2_c1`,
          author: { name: 'Kavya Nair', avatar: 'KN' },
          text: 'I am doing one unit per day and ending with a quick self quiz at night.',
          timeAgo: '7 hours ago',
          upvotes: 5,
        },
        {
          id: `${subjectId}_t2_c2`,
          author: { name: 'Dev Patel', avatar: 'DP' },
          text: 'I prioritize important derivations and solved examples from class notes.',
          timeAgo: '6 hours ago',
          upvotes: 4,
        },
      ],
    }),
    withCommentCount({
      id: `${subjectId}_t3`,
      title: `Useful resources for ${units[2]?.name || 'Unit 3'}`,
      description: 'Post links, summary sheets, or videos that helped you understand this unit quickly.',
      tags: ['Unit 3', 'Resources'],
      author: { name: 'Rohit Sharma', avatar: 'RS' },
      upvotes: 12,
      downvotes: 0,
      timeAgo: '1 day ago',
      comments: [],
    }),
  ];
}

export const THREADS_BY_SUBJECT = ALL_SUBJECT_IDS.reduce((acc, subjectId) => {
  acc[subjectId] = buildDefaultThreads(subjectId);
  return acc;
}, {});

THREADS_BY_SUBJECT.cs101 = [
  withCommentCount({
    id: 'cs101_t1',
    title: 'How do I solve implicit differentiation questions faster?',
    description: 'I get stuck when both x and y are inside trigonometric terms. Can someone explain a clean method to isolate dy/dx?',
    tags: ['Unit 1', 'Differentiation', 'Help'],
    author: { name: 'Arjun Mehta', avatar: 'AM' },
    upvotes: 28,
    downvotes: 2,
    timeAgo: '2 hours ago',
    comments: [
      {
        id: 'cs101_t1_c1',
        author: { name: 'Sneha Patel', avatar: 'SP' },
        text: 'Differentiate both sides first, then move all dy/dx terms to one side before simplifying.',
        timeAgo: '1 hour ago',
        upvotes: 16,
      },
      {
        id: 'cs101_t1_c2',
        author: { name: 'Dr. Priya Sharma', avatar: 'PS' },
        text: 'I will share a solved worksheet tomorrow. Focus on chain rule and grouping terms clearly.',
        timeAgo: '52 min ago',
        upvotes: 24,
      },
    ],
  }),
  withCommentCount({
    id: 'cs101_t2',
    title: 'Best method for sin^2(x) integration without memorizing formulas?',
    description: 'I want to understand the transformation steps rather than memorizing identities blindly.',
    tags: ['Unit 2', 'Integration', 'Concept'],
    author: { name: 'Kavya Nair', avatar: 'KN' },
    upvotes: 19,
    downvotes: 0,
    timeAgo: '6 hours ago',
    comments: [
      {
        id: 'cs101_t2_c1',
        author: { name: 'Riya Verma', avatar: 'RV' },
        text: 'Use sin^2(x) = (1 - cos(2x))/2, then the integral becomes direct.',
        timeAgo: '4 hours ago',
        upvotes: 11,
      },
    ],
  }),
  withCommentCount({
    id: 'cs101_t3',
    title: 'Fourier visualizer resource that helped me a lot',
    description: 'Found an interactive tool where you can add harmonics and see convergence. Posting here for everyone.',
    tags: ['Unit 4', 'Resources'],
    author: { name: 'Sneha Patel', avatar: 'SP' },
    upvotes: 43,
    downvotes: 1,
    timeAgo: '1 day ago',
    comments: [
      {
        id: 'cs101_t3_c1',
        author: { name: 'Rohit Sharma', avatar: 'RS' },
        text: 'This is excellent for intuition. Thanks for sharing.',
        timeAgo: '22 hours ago',
        upvotes: 8,
      },
    ],
  }),
];

function buildGenericQuestions(subjectName, unitName, quizId, count) {
  const questions = [];
  for (let index = 0; index < count; index += 1) {
    questions.push({
      id: `${quizId}_q${index + 1}`,
      text: `${subjectName}: ${unitName} checkpoint ${index + 1}. Which statement is most accurate?`,
      options: [
        'Statement A is fully correct',
        'Statement B is mostly correct',
        'Statement C is partially correct',
        'Statement D is not correct',
      ],
      correct: index % 4,
    });
  }
  return questions;
}

function buildDefaultQuizzes(subjectId) {
  const subject = SUBJECT_LOOKUP[subjectId];
  const units = UNITS_BY_SUBJECT[subjectId] || [];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return units.slice(0, 3).map((unit, index) => {
    const questionCount = 6 + index * 2;
    return {
      id: `${subjectId}_quiz_${index + 1}`,
      unitId: unit.id,
      unitName: `Unit ${unit.number}`,
      name: `${unit.name} Quick Quiz`,
      questionCount,
      timeLimit: 8 + index * 4,
      difficulty: difficulties[index],
      questions: buildGenericQuestions(subject.name, unit.name, `${subjectId}_quiz_${index + 1}`, questionCount),
    };
  });
}

export const QUIZZES_BY_SUBJECT = ALL_SUBJECT_IDS.reduce((acc, subjectId) => {
  acc[subjectId] = buildDefaultQuizzes(subjectId);
  return acc;
}, {});

QUIZZES_BY_SUBJECT.cs101 = [
  {
    id: 'cs101_quiz_1',
    unitId: 'u1',
    unitName: 'Unit 1',
    name: 'Limits and Continuity Basics',
    questionCount: 10,
    timeLimit: 15,
    difficulty: 'Easy',
    questions: [
      { id: 'cs101_q1', text: 'What is lim(x->0) sin(x)/x?', options: ['0', '1', 'Infinity', 'Undefined'], correct: 1 },
      { id: 'cs101_q2', text: 'A function is continuous at x = a when:', options: ['f(a) exists only', 'Left and right limits exist only', 'Limit equals function value', 'Derivative exists'], correct: 2 },
      { id: 'cs101_q3', text: 'Derivative of sin(x) is:', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], correct: 0 },
      { id: 'cs101_q4', text: 'Derivative of x^n is:', options: ['x^(n-1)', 'n*x^(n-1)', 'n*x^n', 'x^(n+1)/(n+1)'], correct: 1 },
      { id: 'cs101_q5', text: 'Chain rule applies to:', options: ['f(x)+g(x)', 'f(g(x))', 'f(x)g(x)', 'f(x)/g(x)'], correct: 1 },
      { id: 'cs101_q6', text: 'If lim(x->a)f(x) = L, then near a, f(x) is close to:', options: ['a', '0', 'L', 'Infinity'], correct: 2 },
      { id: 'cs101_q7', text: 'A critical point occurs when:', options: ['f(x)=0', 'f\'(x)=0 or undefined', 'f\'(x)+f(x)=0', 'f\'(x)>0'], correct: 1 },
      { id: 'cs101_q8', text: 'L Hospital rule is used for:', options: ['0/0 and Infinity/Infinity', 'Any fraction', 'Only polynomials', 'Only trigonometric limits'], correct: 0 },
      { id: 'cs101_q9', text: 'Derivative of e^x is:', options: ['x*e^(x-1)', 'e^x', 'ln(x)', '1/e^x'], correct: 1 },
      { id: 'cs101_q10', text: 'Rolle theorem requires continuity on [a,b] and differentiability on:', options: ['[a,b]', '(a,b)', '(a,b] only', '[a,b) only'], correct: 1 },
    ],
  },
  {
    id: 'cs101_quiz_2',
    unitId: 'u2',
    unitName: 'Unit 2',
    name: 'Integration Techniques',
    questionCount: 8,
    timeLimit: 12,
    difficulty: 'Medium',
    questions: [
      { id: 'cs101_q11', text: 'Integral of sin(x) dx is:', options: ['cos(x)+C', '-cos(x)+C', 'sin(x)+C', '-sin(x)+C'], correct: 1 },
      { id: 'cs101_q12', text: 'Method for integral of u dv is:', options: ['Substitution', 'Integration by parts', 'Partial fractions', 'Series expansion'], correct: 1 },
      { id: 'cs101_q13', text: 'Integral of 1/x is:', options: ['x+C', 'ln|x|+C', '1/x^2 + C', 'e^x + C'], correct: 1 },
      { id: 'cs101_q14', text: 'u substitution reverses which differential concept?', options: ['Product rule', 'Chain rule', 'Quotient rule', 'Power rule'], correct: 1 },
      { id: 'cs101_q15', text: 'Integral of e^x is:', options: ['e^x + C', 'x*e^x + C', '1/e^x + C', 'ln(e^x) + C'], correct: 0 },
      { id: 'cs101_q16', text: 'Area between curves is computed using:', options: ['Integral of sum', 'Integral of difference', 'Derivative of difference', 'Average slope'], correct: 1 },
      { id: 'cs101_q17', text: 'sin^2(x) identity useful for integration:', options: ['(1+cos2x)/2', '(1-cos2x)/2', '2sin(x)', '1-sin(x)'], correct: 1 },
      { id: 'cs101_q18', text: 'Definite integrals with limits give:', options: ['Antiderivative only', 'Net area value', 'Slope value', 'Curvature'], correct: 1 },
    ],
  },
  {
    id: 'cs101_quiz_3',
    unitId: 'u5',
    unitName: 'Unit 5',
    name: 'Full Subject Mock Test',
    questionCount: 12,
    timeLimit: 22,
    difficulty: 'Hard',
    questions: buildGenericQuestions('Engineering Mathematics I', 'Comprehensive', 'cs101_quiz_3', 12),
  },
];

const STUDENTS = [
  { name: 'Sneha Patel', avatar: 'SP', badge: 'Gold Scholar', baseScore: 2840, quizzesTaken: 18, streak: 14 },
  { name: 'Arjun Mehta', avatar: 'AM', badge: 'Silver Scholar', baseScore: 2660, quizzesTaken: 17, streak: 11 },
  { name: 'Riya Verma', avatar: 'RV', badge: 'Bronze Scholar', baseScore: 2470, quizzesTaken: 16, streak: 9 },
  { name: 'Kavya Nair', avatar: 'KN', badge: 'Rising Star', baseScore: 2260, quizzesTaken: 14, streak: 7 },
  { name: 'Dev Patel', avatar: 'DP', badge: 'Consistent', baseScore: 2040, quizzesTaken: 13, streak: 5 },
  { name: 'Rohit Sharma', avatar: 'RS', badge: 'Active Learner', baseScore: 1830, quizzesTaken: 12, streak: 4 },
  { name: 'Meera Singh', avatar: 'MS', badge: 'Learner', baseScore: 1650, quizzesTaken: 11, streak: 2 },
  { name: 'Aakash Gupta', avatar: 'AG', badge: 'Learner', baseScore: 1490, quizzesTaken: 9, streak: 1 },
  { name: 'Pooja Iyer', avatar: 'PI', badge: 'Beginner', baseScore: 1310, quizzesTaken: 8, streak: 0 },
  { name: 'You', avatar: 'YO', badge: 'Beginner', baseScore: 1180, quizzesTaken: 7, streak: 3, isCurrentUser: true },
];

function rankEntries(entries) {
  return [...entries]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export const LEADERBOARD_BY_SUBJECT = ALL_SUBJECT_IDS.reduce((acc, subjectId, subjectIndex) => {
  const subjectOffset = subjectIndex * 22;
  const totalEntries = rankEntries(
    STUDENTS.map((student, index) => ({
      ...student,
      score: student.baseScore + subjectOffset - index * 4,
    })),
  );

  const units = UNITS_BY_SUBJECT[subjectId] || [];
  const byUnit = units.reduce((unitAcc, unit, unitIndex) => {
    const entries = rankEntries(
      STUDENTS.map((student, studentIndex) => ({
        ...student,
        score: Math.round((student.baseScore + subjectOffset - studentIndex * 7) * (0.2 + unitIndex * 0.12)),
        quizzesTaken: Math.max(1, Math.round(student.quizzesTaken * (0.25 + unitIndex * 0.1))),
      })),
    );

    unitAcc[unit.id] = entries;
    return unitAcc;
  }, {});

  acc[subjectId] = { total: totalEntries, byUnit };
  return acc;
}, {});

export const CURRENT_USER = {
  name: 'You',
  avatar: 'YO',
  role: 'Student',
  streak: 3,
};

export const AI_QUICK_PROMPTS = [
  'Summarize this unit in 5 bullet points',
  'Give me a 30-minute revision plan',
  'Generate 5 likely exam questions',
  'Explain this topic with a simple analogy',
];

export const AI_RESPONSES = {
  general: [
    'I can help with concepts, revision plans, and quiz practice. Select a subject and ask your question.',
    'Ask me for formulas, quick summaries, or likely exam questions. I will keep answers concise.',
    'If you tell me your weak unit, I can build a focused practice plan with checkpoints.',
  ],
  units: {
    u1: [
      'Unit 1 usually builds the foundation. Focus on definitions, first principles, and two solved examples for each concept.',
      'For Unit 1 revision: review theory for 20 minutes, solve 6 short questions, then explain the topic in your own words.',
      'If Unit 1 feels heavy, break it into concept groups and solve one mixed worksheet after each group.',
    ],
    u2: [
      'Unit 2 problems improve when you track steps clearly. Write method names before each solution to avoid random attempts.',
      'For Unit 2, practice pattern recognition. Identify whether substitution, formula use, or direct simplification is needed first.',
      'Use a timer on Unit 2 exercises: 8 minutes per problem set helps exam-speed recall.',
    ],
    u3: [
      'Unit 3 usually combines concepts. Build a one-page map of prerequisites before solving advanced questions.',
      'Try mixed-level Unit 3 questions: easy for confidence, medium for method, hard for depth.',
      'When stuck in Unit 3, rewrite the question in your own words and list known data before solving.',
    ],
    u4: [
      'Unit 4 often needs visualization. Draw small diagrams and annotate each transformation step.',
      'Create a formula-to-application table for Unit 4. It reduces confusion during long derivations.',
      'Unit 4 revision works best with spaced recall: 3 short sessions across the day instead of one long session.',
    ],
    u5: [
      'Unit 5 is best revised with past-paper style questions. Start timed practice early.',
      'For Unit 5, collect common mistakes from previous tests and review them before each quiz attempt.',
      'Make a final revision sheet for Unit 5 with formulas, edge cases, and one solved example per pattern.',
    ],
  },
  bySubject: {
    cs101: [
      'For MA101, prioritize derivatives, integration technique selection, and Laplace transform tables.',
      'In Mathematics I, marks are usually easy to gain from method steps. Show full workings clearly.',
    ],
    cs203: [
      'For Data Structures, focus on operation complexity and when to choose each structure.',
      'Practice dry-run tracing for trees and graph traversal to improve coding accuracy.',
    ],
    cs401: [
      'In Operating Systems, compare scheduling algorithms by turnaround time, waiting time, and fairness.',
      'Memory management questions often need diagrams. Draw page tables or segmentation maps clearly.',
    ],
    cs502: [
      'In AI, connect each algorithm with its assumptions and limitations, not just definitions.',
      'For AI exam prep, solve one reasoning question and one search problem daily.',
    ],
  },
  quizTips: [
    'Read all options before selecting. Eliminate obviously wrong choices first.',
    'If time is low, answer easy questions first and mark uncertain ones for review.',
    'After each quiz, revisit incorrect answers and write why each wrong option is wrong.',
  ],
};

export const HOME_HIGHLIGHTS = [
  { id: 'h1', title: 'Daily Goal', text: 'Complete 2 quiz cards and 1 discussion reply' },
  { id: 'h2', title: 'This Week', text: 'Upload notes for at least one pending unit' },
  { id: 'h3', title: 'Reminder', text: 'Review weak topics before starting full mock tests' },
];
