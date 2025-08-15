export type MCItem = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number; // 0-based index into choices
};

export const items: MCItem[] = [
  {
    id: 'eqf-1',
    prompt: 'Which fraction is equivalent to 1/2?',
    choices: ['2/5', '2/4', '3/8', '4/10'],
    answerIndex: 1, // 2/4
  },
  {
    id: 'eqf-2',
    prompt: 'Which fraction is equivalent to 3/4?',
    choices: ['6/8', '3/5', '9/16', '12/20'],
    answerIndex: 0, // 6/8
  },
  {
    id: 'eqf-3',
    prompt: 'Which fraction is equivalent to 2/5?',
    choices: ['4/10', '3/7', '5/12', '6/20'],
    answerIndex: 0, // 4/10
  },
  {
    id: 'eqf-4',
    prompt: 'Which fraction is equivalent to 5/6?',
    choices: ['10/12', '8/9', '7/10', '5/12'],
    answerIndex: 0, // 10/12
  },
  {
    id: 'eqf-5',
    prompt: 'Which fraction is equivalent to 4/9?',
    choices: ['6/9', '8/18', '12/20', '10/18'],
    answerIndex: 1, // 8/18
  },
  {
    id: 'eqf-6',
    prompt: 'Which fraction is equivalent to 2/3?',
    choices: ['3/6', '6/9', '5/9', '4/9'],
    answerIndex: 1, // 6/9
  },
  {
    id: 'eqf-7',
    prompt: 'Which fraction is equivalent to 3/5?',
    choices: ['6/15', '9/10', '12/20', '15/30'],
    answerIndex: 2, // 12/20
  },
  {
    id: 'eqf-8',
    prompt: 'Which fraction is equivalent to 1/3?',
    choices: ['2/6', '3/9', '4/12', 'All of these'],
    answerIndex: 3, // all are equivalent
  },
];
