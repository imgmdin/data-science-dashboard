// Certificate template catalogue. Template ids are stable: they are stored in the database.
export type TemplateDef = {
  id: string;
  name: string;
  filled: boolean;
  layout: string;
  recipient: string;
  title: string;
  statement: string;
  event: string;
  badge: string;
};

export const TEMPLATES: TemplateDef[] = [
  {
    "id": "workshop-participation",
    "name": "Workshop participation",
    "filled": true,
    "layout": "workshop",
    "title": "CERTIFICATE\nOF PARTICIPATION",
    "recipient": "Ayesha Khan",
    "statement": "For participating in the workshop",
    "event": "Introduction to Data Science",
    "badge": ""
  },
  {
    "id": "webinar-attendance",
    "name": "Webinar / seminar attendance",
    "filled": true,
    "layout": "standard",
    "title": "CERTIFICATE\nOF ATTENDANCE",
    "recipient": "Ayesha Khan",
    "statement": "For attending the guest session",
    "event": "Data Science in Practice",
    "badge": ""
  },
  {
    "id": "course-completion",
    "name": "Course / bootcamp completion",
    "filled": true,
    "layout": "standard",
    "title": "CERTIFICATE\nOF COMPLETION",
    "recipient": "Ayesha Khan",
    "statement": "For completing the requirements of",
    "event": "Python for Data Analysis",
    "badge": ""
  },
  {
    "id": "assessed-achievement",
    "name": "Assessed achievement",
    "filled": true,
    "layout": "standard",
    "title": "CERTIFICATE\nOF ACHIEVEMENT",
    "recipient": "Ayesha Khan",
    "statement": "For meeting the assessment requirements of",
    "event": "Applied Machine Learning",
    "badge": ""
  },
  {
    "id": "challenge-participation",
    "name": "Data challenge participation",
    "filled": true,
    "layout": "standard",
    "title": "CERTIFICATE\nOF PARTICIPATION",
    "recipient": "Ayesha Khan",
    "statement": "For participating in the society challenge",
    "event": "Data Science Challenge",
    "badge": ""
  },
  {
    "id": "competition-award",
    "name": "Competition award",
    "filled": false,
    "layout": "centered award",
    "title": "CERTIFICATE\nOF DISTINCTION",
    "recipient": "Ayesha Khan",
    "statement": "Awarded for outstanding performance in",
    "event": "Data Science Challenge",
    "badge": "WINNER"
  },
  {
    "id": "speaker-appreciation",
    "name": "Speaker / trainer appreciation",
    "filled": false,
    "layout": "centered speaker",
    "title": "CERTIFICATE\nOF APPRECIATION",
    "recipient": "Ayesha Khan",
    "statement": "In appreciation of your contribution as a guest speaker",
    "event": "Data Science Research Seminar",
    "badge": ""
  },
  {
    "id": "mentor-judge-recognition",
    "name": "Mentor / judge recognition",
    "filled": false,
    "layout": "centered mentor",
    "title": "CERTIFICATE\nOF RECOGNITION",
    "recipient": "Ayesha Khan",
    "statement": "In recognition of your contribution as a mentor",
    "event": "Data Science Challenge",
    "badge": "MENTOR"
  },
  {
    "id": "organizer-volunteer-service",
    "name": "Organizer / volunteer service",
    "filled": false,
    "layout": "service",
    "title": "CERTIFICATE\nOF SERVICE",
    "recipient": "Ayesha Khan",
    "statement": "In appreciation of your service as an event organizer",
    "event": "Data Science Workshop Series",
    "badge": ""
  },
  {
    "id": "cabinet-tenure",
    "name": "Cabinet / office-bearer tenure",
    "filled": false,
    "layout": "centered cabinet",
    "title": "CERTIFICATE\nOF SERVICE",
    "recipient": "Ayesha Khan",
    "statement": "In recognition of your service to the Data Science Society",
    "event": "Cabinet Member",
    "badge": ""
  },
  {
    "id": "partner-appreciation",
    "name": "Partner / sponsor appreciation",
    "filled": false,
    "layout": "centered partner",
    "title": "CERTIFICATE\nOF APPRECIATION",
    "recipient": "Partner Organization",
    "statement": "In appreciation of your support for",
    "event": "Data Science Workshop Series",
    "badge": ""
  },
  {
    "id": "research-presentation",
    "name": "Research / poster presentation",
    "filled": false,
    "layout": "research",
    "title": "CERTIFICATE\nOF PRESENTATION",
    "recipient": "Ayesha Khan",
    "statement": "For presenting research at the society seminar",
    "event": "Interpretable Machine Learning",
    "badge": ""
  }
];

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
