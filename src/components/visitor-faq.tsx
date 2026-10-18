import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  { question: "What is your academic background?", answer: "I studied philosophy at Jahangirnagar University, Dhaka, completing both a B.A. and an M.A. My approach is rooted in critical thinking, analysis, and clear communication." },
  { question: "What are your interests beyond philosophy?", answer: "Theatre, Bengali literature, and community volunteering are part of my story. I also explore digital content and design, using tools such as Canva, WordPress, and Microsoft Office." },
  { question: "Can we connect if we’re in different places?", answer: "Yes. I’m based in Dhaka, Bangladesh, and open to connections everywhere — whether the conversation begins with an idea, an opportunity, or a shared perspective." },
  { question: "What’s the best way to get in touch?", answer: "Send a message through the form above, or connect with me on LinkedIn. Include a little about yourself and what you have in mind so we can start a thoughtful conversation." },
];

export function VisitorFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div id="questions" className="visitor-faq" aria-labelledby="questions-heading">
      <div className="faq-intro">
        <span className="micro-label">Before we connect</span>
        <h3 id="questions-heading">A few things you<br />might be <span className="font-editorial italic">wondering.</span></h3>
      </div>
      <div className="faq-list">
        {QUESTIONS.map((item, index) => (
          <article key={item.question} className="faq-item">
            <h4>
              <Button variant="ghost" className="faq-trigger" aria-expanded={open === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}>
                <span>{item.question}</span>
                {open === index ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
              </Button>
            </h4>
            <div id={`faq-answer-${index}`} hidden={open !== index} className="faq-answer"><p>{item.answer}</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}