import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  useEffect(() => { api.get("/faqs").then((r) => setFaqs(r.data)); }, []);

  const grouped = faqs.reduce((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {});

  return (
    <div data-testid="faq-page" className="max-w-4xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="eyebrow mb-4">Frequently Asked</div>
      <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
        Questions, answered.
      </h1>

      <div className="mt-14 space-y-14">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="eyebrow mb-4">{cat}</div>
            <Accordion type="single" collapsible className="w-full">
              {items.map((f) => (
                <AccordionItem key={f.id} value={f.id} data-testid={`faq-item-${f.id}`}>
                  <AccordionTrigger className="font-display text-xl md:text-2xl text-left" style={{ color: "var(--obsidian)" }}>
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed" style={{ color: "var(--charcoal)" }}>
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
