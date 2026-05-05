import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQViewProps {
  onBack: () => void;
  userRole: 'student' | 'supervisor' | 'technician';
}

interface FAQ {
  question: string;
  answer: string;
  roles: ('student' | 'supervisor' | 'technician')[];
}

const faqs: FAQ[] = [
  {
    question: 'How do I submit a complaint?',
    answer: 'Click the "Submit New Complaint" button on your dashboard. Fill in the category, room number, urgency level, and description of the issue. Your complaint will be submitted immediately and forwarded to the supervisor for review.',
    roles: ['student'],
  },
  {
    question: 'How long does it take to resolve a complaint?',
    answer: 'Resolution time varies based on urgency and complexity. High priority complaints are typically addressed within 24 hours, medium priority within 48 hours, and low priority within 3-5 days. You can track the progress in real-time on your dashboard.',
    roles: ['student', 'supervisor', 'technician'],
  },
  {
    question: 'Can I track the status of my complaint?',
    answer: 'Yes! Your dashboard shows all your complaints with their current status: Pending, Assigned, In Progress, or Resolved. Click "View Details" on any complaint to see the complete timeline and assignment information.',
    roles: ['student'],
  },
  {
    question: 'What categories can I report?',
    answer: 'You can report issues in the following categories: Plumbing (leaks, drainage), Electrical (lights, outlets), Internet (WiFi connectivity), AC/Fan (cooling issues), Furniture (broken items), and Other (miscellaneous issues).',
    roles: ['student', 'supervisor', 'technician'],
  },
  {
    question: 'Who can see my complaints?',
    answer: 'Your complaints are visible to supervisors who review and assign them, and technicians who work on them. Only GIKI verified users can access the system.',
    roles: ['student'],
  },
  {
    question: 'How do I assign a complaint to a technician?',
    answer: 'Review pending complaints on your dashboard. Click "View Details" on a complaint, then click "Assign Technician". Select the appropriate technician from the dropdown based on the issue category and submit. The technician will be notified immediately.',
    roles: ['supervisor'],
  },
  {
    question: 'Can I reassign a complaint to a different technician?',
    answer: 'Yes, you can reassign complaints that are in "Assigned" status but not yet started. View the complaint details and use the reassign option. Once work has started, contact the technician directly for coordination.',
    roles: ['supervisor'],
  },
  {
    question: 'How do I reject a complaint?',
    answer: 'If a complaint is invalid, duplicate, or outside the scope of hostel maintenance, you can reject it from the complaint detail view. Add a brief reason before rejecting so the student understands why it was not processed.',
    roles: ['supervisor'],
  },
  {
    question: 'How do I start working on an assigned task?',
    answer: 'Open the task from your dashboard by clicking "View Details", then click the "Start Task" button. This updates the status to "In Progress" and notifies the student that work has begun.',
    roles: ['technician'],
  },
  {
    question: 'How do I mark a task as resolved?',
    answer: 'Once you have completed the work, open the task details and click "Mark as Resolved". This will update the status and notify the student that the issue has been fixed. Make sure the issue is completely resolved before marking it.',
    roles: ['technician'],
  },
  {
    question: 'What if I need parts or additional help?',
    answer: 'Contact your supervisor through the system or directly. You can also add notes in the task timeline (feature coming soon) to keep everyone informed about delays or requirements.',
    roles: ['technician'],
  },
  {
    question: 'Can I change the urgency level of a complaint?',
    answer: 'Supervisors can update urgency levels when reviewing complaints. If you notice an issue marked as low priority but requires immediate attention, update it to high priority before assigning to a technician.',
    roles: ['supervisor'],
  },
  {
    question: 'What should I do if the issue persists after resolution?',
    answer: 'Submit a new complaint referencing the previous complaint ID. This helps track recurring issues and ensures they get proper attention. You can also contact the supervisor directly for urgent matters.',
    roles: ['student'],
  },
  {
    question: 'How are notifications sent?',
    answer: 'You will receive in-app notifications when: your complaint is reviewed, a technician is assigned, work starts, or the issue is resolved. Make sure to check the notification bell icon regularly.',
    roles: ['student', 'supervisor', 'technician'],
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, DormFix is exclusive to GIKI verified users (@giki.edu.pk emails). All data is securely stored and only accessible to authorized personnel involved in the maintenance process.',
    roles: ['student', 'supervisor', 'technician'],
  },
];

export function FAQView({ onBack, userRole }: FAQViewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = faqs.filter((faq) => faq.roles.includes(userRole));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="glass-button mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find answers to common questions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <Card key={index} className="glass-card shadow-md">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                    {faq.question}
                  </CardTitle>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="pt-0 pb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Need More Help */}
        <Card className="glass-card shadow-md mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you couldn't find the answer you're looking for, please contact your supervisor
                  or the hostel administration office during working hours (9 AM - 5 PM).
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Email: hostel.maintenance@giki.edu.pk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
