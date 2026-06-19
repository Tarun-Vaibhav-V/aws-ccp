/** Bug-report helpers — let learners flag a wrong question to the maintainer. */
export const REPORT_EMAIL = 'tarvibe23@gmail.com'
export const REPORT_LINKEDIN = 'https://www.linkedin.com/in/v-tarun-vaibhav-7a3749310/'

/** Build a prefilled mailto: link for reporting an issue with a question. */
export function buildReportMailto(q, examTitle = '') {
  const subject = `AWS CCP bug report — ${examTitle ? examTitle + ' · ' : ''}${q?.id || 'question'}`
  const body = [
    'Hi Tarun,',
    '',
    'I found an issue with this practice question:',
    '',
    `Exam: ${examTitle || '(unknown)'}`,
    `Question ID: ${q?.id || '(unknown)'}`,
    `Question: ${q?.question || ''}`,
    `Listed correct answer: ${(q?.correct || []).join(', ')}`,
    '',
    'What seems wrong (please describe):',
    '',
    '',
    'Please attach screenshot(s) showing the issue as supporting evidence.',
    '',
    'Thanks!',
  ].join('\n')
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
