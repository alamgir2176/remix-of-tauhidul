import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Rich, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  { question: "What did you study?", answer: "Philosophy at Jahangirnagar University. I completed both my BA and my MA there." },
  { question: "Can we connect if we’re in different places?", answer: "Yes. I’m based in Dhaka, Bangladesh, and open to connections everywhere." },
  { question: "What’s the best way to get in touch?", answer: "Send a message through the form above, or connect with me on LinkedIn. Include a little about yourself and what you have in mind so we can start a thoughtful conversation." },
];

export function VisitorFaq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div id="questions" className="visitor-faq" aria-labelledby="questions-heading">
      <div className="faq-intro">
        <span className="micro-label">{t("Before we connect")}</span>
        <h3 id="questions-heading"><Rich text={t("A few things you\nmight be *wondering.*")} /></h3>
      </div>
      <div className="faq-list">
        {QUESTIONS.map((item, index) => (
          <article key={item.question} className="faq-item">
            <h4>
              <Button variant="ghost" className="faq-trigger" aria-expanded={open === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}>
                <span>{t(item.question)}</span>
                {open === index ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
              </Button>
            </h4>
            <div id={`faq-answer-${index}`} hidden={open !== index} className="faq-answer"><p>{t(item.answer)}</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}